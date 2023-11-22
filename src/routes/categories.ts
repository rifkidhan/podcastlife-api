import { Context } from "hono";
import { getPodcastsFromCategory } from "#/controllers/category.ts";
import { integer } from "#/helpers/matching.ts";
import { Status } from "http-status";

export const getCategoryByName = async (c: Context) => {
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
			Status.OK
		);
	} catch (error) {
		throw error;
	}
};
