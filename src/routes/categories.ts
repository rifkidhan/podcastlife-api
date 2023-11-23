import { Hono, HTTPException } from "hono";
import { getPodcastsFromCategory } from "#/models/category.ts";
import { integer } from "#/helpers/matching.ts";
import { STATUS_CODE, STATUS_TEXT } from "http-status";

const category = new Hono();

/**
 * Get All Podcast from Category
 */
category.get("/:categoryName", async (c) => {
	const cat = c.req.param("categoryName");
	const { perPage, after, before } = c.req.query();

	let reqPage = 50;

	if (perPage && integer(perPage)) {
		reqPage = Number(perPage);
	}

	const data = await getPodcastsFromCategory({
		cat,
		after,
		before,
		perPage: reqPage,
	});

	if (!data || data.rows.length < 1) {
		return c.notFound();
	}

	try {
		return c.json(
			{
				hasNextPage: data.hasNextPage,
				startCursor: data.startCursor,
				endCursor: data.endCursor,
				data: data.rows,
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
