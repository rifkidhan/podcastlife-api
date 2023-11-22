import { podcastApi } from "#/models/podcastapi.ts";
import { feedParser } from "#/models/parsefeed.ts";
import {
	getPodcastByFeedId,
	getPodcastsByTag,
	getPodcastUrl,
} from "#/models/podcast.ts";
import { integer, language } from "#/helpers/matching.ts";
import { errorPodcastApi } from "#/helpers/httpError.ts";
import { HTTPException, Hono } from "hono";
import { cache } from "hono/middleware.ts";
import { STATUS_CODE, STATUS_TEXT } from "http-status";
import { groupingCategories } from "#/helpers/matching.ts";

const now = Math.floor(Date.now() / 1000) - 86400;

const podcast = new Hono();

if (!Deno.env.get("DEV")) {
	/**
	 * caches
	 */
	podcast.get(
		"/podcast/*",
		cache({
			cacheName: "podcasts",
			wait: true,
			cacheControl: "max-age=86400, must-revalidate",
		})
	);

	podcast.get(
		"/tags/*",
		cache({
			cacheName: "tags",
			wait: true,
			cacheControl: "max-age=172800, must-revalidate",
		})
	);
}

/**
 * Get Full info from database and parser
 */
podcast.get("/podcast/full/:feedId", async (c) => {
	const id = c.req.param("feedId");

	const data = await getPodcastByFeedId(Number(id));

	if (!data) {
		return c.notFound();
	}

	const items = await feedParser(data.url);

	try {
		return c.json(
			{
				data,
				items,
			},
			STATUS_CODE.OK
		);
	} catch (error) {
		throw error;
	}
});

/**
 * Get podcast url and full info from parser
 */
podcast.get("/podcast/info/:feedId", async (c) => {
	const id = c.req.param("feedId");

	const data = await getPodcastUrl(Number(id));

	if (!data) {
		return c.notFound();
	}

	const items = await feedParser(data.url);

	try {
		return c.json(
			{
				data,
				items,
			},
			STATUS_CODE.OK
		);
	} catch (error) {
		throw error;
	}
});

/**
 * Get Episodes from request url
 */

podcast.get("/podcast/episodes/:url", async (c) => {
	const { url } = c.req.param();

	if (!url) {
		throw new HTTPException(STATUS_CODE.BadRequest, {
			message: STATUS_TEXT[STATUS_CODE.BadRequest],
		});
	}

	const items = await feedParser(url);

	try {
		return c.json(
			{
				liveitems: items?.podcastLiveItems,
				episodes: items?.items,
			},
			STATUS_CODE.OK
		);
	} catch (error) {
		throw error;
	}
});

/**
 * Get trending podcast from podcastindex
 */

podcast.get("/trending", async (c) => {
	const { max, cat } = c.req.query();

	let maxResponse = 10;

	const category = groupingCategories(cat);

	if (max) {
		maxResponse = Number(max);
	}

	let url = `/podcasts/trending?max=${maxResponse}&since=${now}&lang=${language}&pretty`;

	if (category) {
		const categories = category
			.map((tags) => {
				const firstWord = tags.charAt(0).toUpperCase();
				const rest = tags.slice(1);

				return firstWord + rest;
			})
			.toString();
		url = `/podcasts/trending?max=${maxResponse}&since=${now}&lang=${language}&cat=${categories}&pretty`;
	}

	try {
		const trending = await podcastApi(url);
		if (trending.ok) {
			const data = await trending.json();
			return c.json({ data }, STATUS_CODE.OK);
		}
		errorPodcastApi(trending.status);
	} catch (error) {
		throw error;
	}
});

/**
 * Get All podcast from tags
 */
podcast.get("/tags/:tag", async (c) => {
	const { tag } = c.req.param();
	const { perPage, after, before } = c.req.query();

	let reqPage = 50;

	if (perPage && integer(perPage)) {
		reqPage = Number(perPage);
	}

	const data = await getPodcastsByTag({ tag, after, before, perPage: reqPage });

	if (data.rows.length < 1) {
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
 * Get live podcast from podcastindex
 */
podcast.get("/live", async (c) => {
	const { max } = c.req.query();
	let maxItem = 50;

	if (max) {
		maxItem = Number(max);
	}
	const result = await podcastApi(`/episodes/live?max=${maxItem}&pretty`);

	if (!result.ok) {
		throw new HTTPException(result.status);
	}

	const data = await result.json();
	return c.json({ data }, STATUS_CODE.OK);
});

/**
 * Decline method
 */
podcast.on(["PUT", "DELETE", "POST", "OPTIONS", "PATCH"], "/*", () => {
	throw new HTTPException(STATUS_CODE.MethodNotAllowed, {
		message: STATUS_TEXT[STATUS_CODE.MethodNotAllowed],
	});
});

export default podcast;
