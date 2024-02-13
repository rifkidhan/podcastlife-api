import { Hono, HTTPException } from "hono";
import { STATUS_CODE, STATUS_TEXT } from "http-status";
import { podcastApi } from "#/models/podcastapi.ts";
import { logs } from "#/middlerwares/log.ts";
import { PodcastLiveStream } from "#/types.ts";
import { getLiveItem, PodcastLiveItem } from "#/helpers/live.ts";
import type { GetLiveParams } from "#/helpers/live.ts";
import { cache } from "#/middlerwares/cache.ts";
import { getXataClient, DatabaseSchema } from "#/db/xata.ts";
import { TransactionOperation } from "npm:@xata.io/client@latest";

const xata = getXataClient();

const episodes = new Hono();

/**
 * Cache data
 */
episodes.get(
  "/single",
  cache({
    cacheControl: "public, max-age=86400, stale-while-revalidate=86400",
  })
);

episodes.get(
  "/live",
  cache({
    cacheControl: "public, max-age=1800, stale-while-revalidate=1800",
  })
);

/**
 * get single episode using episode guid and feedId
 */
episodes.get("/single", async (c) => {
  const { guid, feedId } = c.req.query();

  if (!guid || !feedId) {
    throw new HTTPException(STATUS_CODE.BadRequest, {
      message: STATUS_TEXT[STATUS_CODE.BadRequest],
    });
  }

  const query = {
    guid,
    feedid: feedId,
    fulltext: "true",
  };

  const [podcast, data] = await Promise.all([
    xata.db.podcasts.read(feedId),
    podcastApi("/episodes/byguid", query).then((res) => res.json()),
  ]);

  const episode = data.episode;

  logs("get espidode from ", feedId, "guid ", guid);

  return c.json(
    {
      data: {
        ...episode,
        pubDate: episode.datePublished,
        author: podcast?.author,
        enclosure: {
          url: episode.enclosureUrl,
          length: episode.enclosureLength,
          type: episode.enclosureType,
        },
        image: episode.image ?? episode.feedImage,
        chapters: episode.chaptersUrl,
        value: {
          type: episode.value?.model.type,
          method: episode.value?.model.method,
          suggested: episode.value?.model.suggested,
          recipients: episode.value?.destinations,
        },
      },
    },
    STATUS_CODE.OK
  );
});

/**
 * Get live episode
 */
episodes.get("/live", async (c) => {
  /**
   * get live items from podcastindex only en & in
   */
  const result = await podcastApi(`/episodes/live`, { max: "100" });

  if (!result.ok) {
    throw new HTTPException(STATUS_CODE["BadRequest"]);
  }

  const items = (await result
    .json()
    .then((res) => res.items)) as PodcastLiveStream[];

  const idx = new Set();

  const liveFromPodcastIndex = items.filter((obj) => {
    if (obj.feedLanguage.includes("en" || "in") && obj.categories) {
      const isDuplicate = idx.has(obj.feedId);

      idx.add(obj.feedId);

      if (!isDuplicate) {
        return true;
      }

      return false;
    }
  });

  const getPodcasts = liveFromPodcastIndex.map((item) => {
    return {
      get: {
        table: "podcasts",
        id: String(item.feedId),
        columns: ["id", "author", "url"],
      },
    };
  }) satisfies TransactionOperation<DatabaseSchema, keyof DatabaseSchema>[];

  const getFeedsFromDb = await xata.transactions.run(getPodcasts);

  const feeds = getFeedsFromDb.results
    .filter((item: any) => typeof item.columns.id === "string")
    .map((item: any) => {
      return item.columns;
    }) as GetLiveParams[];

  let live: PodcastLiveItem[] = [];

  await Promise.all(
    feeds.map((item) =>
      getLiveItem(item).then((res) => {
        if (res) {
          live = live.concat(res);
        }
      })
    )
  );

  return c.json({ data: live }, STATUS_CODE.OK);
});

/**
 * Decline method
 */
episodes.on(["PUT", "DELETE", "OPTIONS", "PATCH", "POST"], "/*", () => {
  throw new HTTPException(STATUS_CODE.MethodNotAllowed, {
    message: STATUS_TEXT[STATUS_CODE.MethodNotAllowed],
  });
});

export default episodes;
