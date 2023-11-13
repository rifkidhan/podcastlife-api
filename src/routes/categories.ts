import { Context } from "hono";
import { getPodcastsFromCategory } from "#/controllers/category.ts";
import { integer } from "#/helpers/matching.ts";
import { Status } from "http-status";

export const getCategoryByName = async (c: Context) => {
	const cat = c.req.param("categoryName");
	const { limit, page } = c.req.query();

	let reqLimit = 50;
	let reqPage = 1;

	if (limit && integer(limit)) {
		reqLimit = Number(limit);
	}

	if (page && integer(page)) {
		reqPage = Number(page);
	}

	const data = await getPodcastsFromCategory({
		cat,
		limit: reqLimit,
		page: reqPage,
	});

	if (!data || data.rows.length < 1) {
		return c.notFound();
	}

	try {
		return c.json(
			{
				ok: true,
				hasNextPage: data.hasNextPage,
				nextpage: data.hasNextPage ? reqPage + 1 : undefined,
				hasPrevPage: data.hasPrevPage,
				prevPage: data.hasPrevPage ? reqPage - 1 : undefined,
				data: data.rows,
			},
			Status.OK
		);
	} catch (error) {
		throw error;
	}
};
