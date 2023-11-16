import { podcastApi } from "#/controllers/podcastapi.ts";
import { feedParser } from "#/controllers/parsefeed.ts";
import {
	getPodcastByFeedId,
	getPodcastsByTag,
	getPodcastUrl,
} from "#/controllers/podcast.ts";
import { integer, language } from "#/helpers/matching.ts";
import { errorPodcastApi } from "#/helpers/httpError.ts";
import { Context, HTTPException } from "hono";
import { Status, STATUS_TEXT } from "http-status";
import { groupingCategories } from "#/helpers/matching.ts";

const now = Math.floor(Date.now() / 1000) - 86400;

/**
 * Get Full podcast
 * @param {Context} c
 * @returns Promise<Response>
 */
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
				data,
				items,
			},
			Status.OK
		);
	} catch (error) {
		throw error;
	}
};

/**
 * Get only podcast infor
 * @param {Context} c
 * @returns Promise<Response>
 */
export const getPodcastInfo = async (c: Context) => {
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
			Status.OK
		);
	} catch (error) {
		throw error;
	}
};

export const getEpisodes = async (c: Context) => {
	const { url } = c.req.query();

	if (!url) {
		throw new HTTPException(Status.BadRequest, {
			message: STATUS_TEXT[Status.BadRequest],
		});
	}

	const items = await feedParser(url);

	try {
		return c.json(
			{
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
			return c.json({ data }, Status.OK);
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

export const getLive = async (c: Context) => {
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
	return c.json({ data }, Status.OK);
};
