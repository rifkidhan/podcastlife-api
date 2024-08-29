import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { integer, language } from "#/helpers/matching.ts";
import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";
import { logs } from "#/middlerwares/log.ts";
import { cache } from "#/middlerwares/cache.ts";
import { CategoryPodcastRecord, getXataClient } from "#/db/xata.ts";
import { Page, SelectedPick } from "npm:@xata.io/client@latest";

const category = new Hono();

const xata = getXataClient();

category.get(
  "/*",
  cache({
    cacheControl: "public, max-age=7200, stale-while-revalidate=1800",
  }),
);

/**
 * Get All Podcast from Category
 */
category.get("/:categoryName", async (c) => {
  const cat = c.req.param("categoryName");
  const { perPage, before, after, lang } = c.req.query();

  let reqPage = 50;

  if (perPage && integer(perPage)) {
    reqPage = Number(perPage);
  }

  const group = await xata.db.categories
    .filter({
      title: cat,
    })
    .getFirst();

  if (!group) {
    return c.notFound();
  }

  let categories: Page<
    CategoryPodcastRecord,
    SelectedPick<
      CategoryPodcastRecord,
      (
        | "podcast.id"
        | "podcast.title"
        | "podcast.description"
        | "podcast.image"
        | "podcast.explicit"
        | "podcast.author"
        | "podcast.owner"
        | "podcast.newestItemPubdate"
      )[]
    >
  >;

  if (lang) {
    const languages = language(lang).split(",");
    categories = await xata.db.category_podcast
      .select([
        "podcast.id",
        "podcast.title",
        "podcast.author",
        "podcast.owner",
        "podcast.explicit",
        "podcast.newestItemPubdate",
        "podcast.description",
        "podcast.image",
      ])
      .filter({
        "category.id": group.id,
        "podcast.language": { $any: languages },
      })
      .sort("podcast.newestItemPubdate", "desc")
      .getPaginated({
        consistency: "eventual",
        pagination: {
          size: reqPage,
          before,
          after,
        },
      });
  } else {
    categories = await xata.db.category_podcast
      .select([
        "podcast.id",
        "podcast.title",
        "podcast.author",
        "podcast.owner",
        "podcast.explicit",
        "podcast.newestItemPubdate",
        "podcast.description",
        "podcast.image",
      ])
      .filter({
        "category.id": group.id,
      })
      .sort("podcast.newestItemPubdate", "desc")
      .getPaginated({
        consistency: "eventual",
        pagination: {
          size: reqPage,
          before,
          after,
        },
      });
  }

  logs(cat);

  return c.json(
    {
      data: categories.records.map((item) => item.podcast),
      meta: categories.meta,
    },
    STATUS_CODE.OK,
  );
});

/**
 * Decline method
 */
category.on(["PUT", "DELETE", "POST", "OPTIONS", "PATCH"], "/*", () => {
  throw new HTTPException(STATUS_CODE.MethodNotAllowed, {
    message: STATUS_TEXT[STATUS_CODE.MethodNotAllowed],
  });
});

export default category;
