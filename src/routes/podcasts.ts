import { podcastApi } from "#/models/podcastapi.ts";
import { feedParser } from "#/models/parsefeed.ts";
import { FeedObject } from "https://esm.sh/podcast-partytime@4.7.0";
import {
	getPodcastByFeedId,
	getPodcastsByTag,
	getPodcastUrl,
} from "#/models/podcast.ts";
import { integer, language } from "#/helpers/matching.ts";
import { errorPodcastApi } from "#/helpers/httpError.ts";
import { HTTPException, Hono } from "hono";
import { STATUS_CODE, STATUS_TEXT } from "http-status";
import { groupingCategories } from "#/helpers/matching.ts";
import { logs } from "#/middlerwares/log.ts";
import { PodcastLiveStream } from "#/types.ts";
import { getLiveItem } from "#/helpers/live.ts";
import { cache } from "#/middlerwares/cache.ts";

const now = Math.floor(Date.now() / 1000) - 86400;

const podcast = new Hono();

podcast.get(
	"/podcast/*",
	cache({
		cacheControl: "public, max-age=86400, stale-while-revalidate=86400",
	})
);

podcast.get(
	"/tags/*",
	cache({
		cacheControl: "public, max-age=86400, stale-while-revalidate=86400",
	})
);
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
		logs("get full podcast data from : ", id);
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
		logs("get info podcast data from : ", id);
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

podcast.post("/podcast/url", async (c) => {
	const { url } = await c.req.json();

	console.log(url);

	if (!url) {
		throw new HTTPException(STATUS_CODE.BadRequest, {
			message: STATUS_TEXT[STATUS_CODE.BadRequest],
		});
	}

	const items = await feedParser(url);

	try {
		logs("get episodes url data from : ", url);
		return c.json(
			{
				items,
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
 * Get live podcast
 */
podcast.get("/live", async (c) => {
	/**
	 * get live items from podcastindex only en & in
	 */
	const result = await podcastApi(`/episodes/live?max=100&pretty`);

	if (!result.ok) {
		throw new HTTPException(result.status);
	}

	const items = await result.json().then((res) => res.items);

	const fromIndex: PodcastLiveStream[] = [];
	const idx = new Set();

	const liveFromPodcastIndex = items.filter((obj: PodcastLiveStream) => {
		const isDuplicate = idx.has(obj.feedId);

		idx.add(obj.feedId);

		if (!isDuplicate) {
			return true;
		}

		return false;
	});

	for (const index of liveFromPodcastIndex) {
		if (index.feedLanguage.includes("en" || "in")) {
			fromIndex.push(index);
		}
	}

	const live: FeedObject["podcastLiveItems"] = [];

	for (const items of fromIndex) {
		const liveItems = await getLiveItem(items.feedId);
		if (liveItems) {
			liveItems.map((item) => live.push(item));
		}
	}

	return c.json({ items: live }, STATUS_CODE.OK);
});

/**
 * Decline method
 */
podcast.on(["PUT", "DELETE", "OPTIONS", "PATCH"], "/*", () => {
	throw new HTTPException(STATUS_CODE.MethodNotAllowed, {
		message: STATUS_TEXT[STATUS_CODE.MethodNotAllowed],
	});
});

export default podcast;
