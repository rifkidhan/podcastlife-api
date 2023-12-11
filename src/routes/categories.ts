import { Hono, HTTPException } from "hono";
import { integer } from "#/helpers/matching.ts";
import { STATUS_CODE, STATUS_TEXT } from "http-status";
import { logs } from "#/middlerwares/log.ts";
import { cache } from "#/middlerwares/cache.ts";
import { podcastDB } from "#/db/deta.ts";
import { groupingCategories } from "#/helpers/matching.ts";

const category = new Hono();

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
	const { perPage, last } = c.req.query();

	let reqPage = 50;

	if (perPage && integer(perPage)) {
		reqPage = Number(perPage);
	}

	const group = groupingCategories(cat);

	if (!group) {
		return c.notFound();
	}

	const parseGroup = group.map((item) => ({
		"tags?contains": item,
	}));

	let categories = await podcastDB.fetch(parseGroup, { limit: reqPage });

	if (last) {
		categories = await podcastDB.fetch(parseGroup, { limit: reqPage, last });
	}

	if (categories.items.length < 1) {
		return c.notFound();
	}

	try {
		logs(cat);
		return c.json(
			{
				data: categories.items,
				count: categories.count,
				last: categories.last,
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
