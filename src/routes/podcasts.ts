import { podcastApi } from "#/controllers/podcastapi.ts";
import { feedParser } from "#/controllers/parsefeed.ts";
import { getPodcastByFeedId, getPodcastsByTag } from "#/controllers/podcast.ts";
import { integer, language } from "#/helpers/matching.ts";
import { errorPodcastApi } from "#/helpers/httpError.ts";
import { Context } from "hono";
import { Status } from "http-status";

const now = Math.floor(Date.now() / 1000) - 86400;

export const getPodcastByFeedIdRoute = async (c: Context) => {
	const id = c.req.param("feedId");

	const data = await getPodcastByFeedId(Number(id));

	if (!data) {
		return c.notFound();
	}

	const items = await feedParser(data.url);

	try {
		return c.json(
			{
				ok: true,
				data,
				liveitems: items?.podcastLiveItems,
				episodes: items?.items,
			},
			Status.OK
		);
	} catch (error) {
		throw error;
	}
};

export const getTrending = async (c: Context) => {
	const { max } = c.req.query();

	let maxResponse = 10;

	if (max) {
		maxResponse = Number(max);
	}

	try {
		const trending = await podcastApi(
			`/podcasts/trending?max=${maxResponse}&since=${now}&lang=${language}&pretty`
		);
		if (trending.ok) {
			const data = await trending.json();
			return c.json({ data, ok: true }, Status.OK);
		}
		errorPodcastApi(trending.status);
	} catch (error) {
		throw error;
	}
};

export const getPodcastsByTagRoute = async (c: Context) => {
	const { tag, limit, page } = c.req.query();

	let reqLimit = 50;
	let reqPage = 1;

	if (limit && integer(limit)) {
		reqLimit = Number(limit);
	}

	if (page && integer(page)) {
		reqPage = Number(page);
	}

	const data = await getPodcastsByTag({ tag, limit: reqLimit, page: reqPage });

	if (data.rows.length < 1) {
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
