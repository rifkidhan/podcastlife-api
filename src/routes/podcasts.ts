import { podcastApi } from "#/models/podcastapi.ts";
import { feedParser } from "#/models/parsefeed.ts";
import { groupingCategories, integer, language } from "#/helpers/matching.ts";
import { errorPodcastApi } from "#/helpers/httpError.ts";
import { Hono, HTTPException } from "hono";
import { STATUS_CODE, STATUS_TEXT } from "http-status";
import { logs } from "#/middlerwares/log.ts";
import { cache } from "#/middlerwares/cache.ts";
import { getXataClient } from "#/db/xata.ts";
import { transaction } from "#/db/xataTransaction.ts";

const xata = getXataClient();

const podcast = new Hono();

// cache
podcast.get(
  "/podcast/*",
  cache({
    cacheControl: "public, max-age=86400, stale-while-revalidate=86400",
  })
);

podcast.get(
  "/trending",
  cache({
    cacheControl: "public, max-age=1800, stale-while-revalidate=3600",
  })
);

podcast.get(
  "/tags/*",
  cache({
    cacheControl: "public, max-age=86400, stale-while-revalidate=86400",
  })
);

podcast.get(
  "/recent",
  cache({
    cacheControl: "public, max-age=7200, stale-while-revalidate=1800",
  })
);

/**
 * Get Full info from database and parser
 */
podcast.get("/podcast/feed/:feedId", async (c) => {
  const id = c.req.param("feedId");

  const data = await xata.db.podcasts.read(id);

  if (!data || !data.url) {
    return c.notFound();
  }

  const items = await feedParser(data.url);

  logs("get full podcast data from : ", id);

  return c.json(
    {
      data: {
        feed: {
          ...data,
          value: items?.value,
          copyright: items?.copyright,
        },
        episodes: items?.items,
        lives: items?.podcastLiveItems,
      },
    },
    STATUS_CODE.OK
  );
});

/**
 * Get Episodes from request url
 */
podcast.get("/podcast/url", async (c) => {
  const { url } = c.req.query();

  if (!url) {
    throw new HTTPException(STATUS_CODE.BadRequest, {
      message: STATUS_TEXT[STATUS_CODE.BadRequest],
    });
  }

  const items = await feedParser(url);

  logs("get episodes url data from : ", url);

  return c.json(
    {
      data: items,
    },
    STATUS_CODE.OK
  );
});

/**
 * Get trending podcast from podcastindex
 */
podcast.get("/trending", async (c) => {
  const { max, cat, from } = c.req.query();

  const category = groupingCategories(cat);

  const since = () => {
    switch (from) {
      case "current":
        return Math.floor(Date.now() / 1000) - 1800;
      case "day":
        return Math.floor(Date.now() / 1000) - 86400;
      case "week":
        return Math.floor(Date.now() / 1000) - 604800;
      case "month":
        return Math.floor(Date.now() / 1000) - 2592000;
      default:
        return Math.floor(Date.now() / 1000) - 86400;
    }
  };

  let query = {
    max: max ? Number(max) : 10,
    lang: language(),
    since: since(),
  };

  if (category.length > 0) {
    const categories = category
      .map((tags) => {
        const firstWord = tags.charAt(0).toUpperCase();
        const rest = tags.slice(1);

        return firstWord + rest;
      })
      .toString();
    query = Object.assign(query, { cat: categories });
  }

  const trending = await podcastApi(`/podcasts/trending?${query}`);
  if (!trending.ok) {
    errorPodcastApi(trending.status);
  }

  const data = await trending.json();
  const reqBody = JSON.stringify({
    operations: data.feeds.map((item: any) => {
      return {
        get: {
          table: "podcasts",
          id: String(item.id),
          columns: [
            "id",
            "title",
            "explicit",
            "author",
            "owner",
            "newestItemPubdate",
            "image",
            "description",
            "tags",
          ],
        },
      };
    }),
  });

  const fromDB = await transaction(reqBody).then((res) =>
    res
      .filter((item: any) => typeof item.columns.id === "string")
      .map((item: any) => {
        return item.columns;
      })
  );

  return c.json({ data: fromDB }, STATUS_CODE.OK);
});

/**
 * Get All podcast from tags
 */
podcast.get("/tags/:tag", async (c) => {
  const { tag } = c.req.param();
  const { perPage, before, after } = c.req.query();

  let reqPage = 50;

  if (perPage && integer(perPage)) {
    reqPage = Number(perPage);
  }

  const data = await xata.db.podcasts
    .select([
      "id",
      "title",
      "newestItemPubdate",
      "description",
      "image",
      "explicit",
      "owner",
      "author",
    ])
    .filter({
      tags: { $includes: tag },
    })
    .sort("newestItemPubdate", "desc")
    .getPaginated({
      consistency: "eventual",
      pagination: {
        size: reqPage,
        before,
        after,
      },
    });

  if (data.records.length < 1) {
    return c.notFound();
  }

  return c.json(
    {
      data: data.records.toSerializable(),
      meta: data.meta,
    },
    STATUS_CODE.OK
  );
});

/**
 * get recent update podcast
 */
podcast.get("/recent", async (c) => {
  const { cat } = c.req.query();

  let data: any[] = [];

  if (cat) {
    const group = await xata.db.categories
      .filter({
        title: cat,
      })
      .getFirst();

    if (!group) {
      return c.notFound();
    }

    const recentdata = await xata.db.category_podcast
      .select([
        "podcast.id",
        "podcast.title",
        "podcast.author",
        "podcast.owner",
        "podcast.explicit",
        "podcast.newestItemPubdate",
        "podcast.description",
        "podcast.image",
        "podcast.tags",
      ])
      .filter({
        "category.id": group.id,
      })
      .getPaginated({
        consistency: "eventual",
      });
    console.log(recentdata.meta);

    data = recentdata.records.map((item) => item.podcast);
  } else {
    const recentData = await xata.db.podcasts
      .select([
        "id",
        "title",
        "newestItemPubdate",
        "description",
        "image",
        "explicit",
        "owner",
        "author",
      ])
      .sort("newestItemPubdate", "desc")
      .getPaginated({
        consistency: "eventual",
      });

    data = recentData.records.toSerializable();
  }

  return c.json(
    {
      data: data,
    },
    STATUS_CODE.OK
  );
});

/**
 * Decline method
 */
podcast.on(["PUT", "DELETE", "OPTIONS", "PATCH", "POST"], "/*", () => {
  throw new HTTPException(STATUS_CODE.MethodNotAllowed, {
    message: STATUS_TEXT[STATUS_CODE.MethodNotAllowed],
  });
});

export default podcast;
