import { Hono, HTTPException } from "hono";
import { integer } from "#/helpers/matching.ts";
import { STATUS_CODE, STATUS_TEXT } from "http-status";
import { logs } from "#/middlerwares/log.ts";
import { cache } from "#/middlerwares/cache.ts";
import { getXataClient } from "#/db/xata.ts";

const category = new Hono();

const xata = getXataClient();

category.get(
  "/*",
  cache({
    cacheControl: "public, max-age=86400, stale-while-revalidate=86400",
  })
);

/**
 * Get All Podcast from Category
 */
category.get("/:categoryName", async (c) => {
  const cat = c.req.param("categoryName");
  const { perPage, before, after } = c.req.query();

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

  const categories = await xata.db.category_podcast
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
      pagination: {
        size: reqPage,
        before,
        after,
      },
    });

  if (categories.records.length < 1) {
    return c.notFound();
  }

  try {
    logs(cat);
    return c.json(
      {
        data: categories.records.toSerializable(),
        meta: categories.meta,
      },
      STATUS_CODE.OK
    );
  } catch (error) {
    throw error;
  }
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
