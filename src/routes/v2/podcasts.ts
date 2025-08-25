import { podcastApi } from "#/lib/api.ts";
import { type DatabaseSchema, getXataClient } from "#/db/xata.ts";
import { Hono } from "@hono/hono";
import { sanitizeHTML } from "#/utils/sanitize.ts";
import { FeedObject, feedParser } from "#/lib/feed.ts";
import { logs } from "#/middlerwares/log.ts";
import { groupingCategories, language } from "#/helpers/matching.ts";
import { errorPodcastApi } from "#/helpers/httpError.ts";
import { type TransactionOperation } from "npm:@xata.io/client@latest";
import { groupBy } from "#/utils/group.ts";
import { HTTPException } from "@hono/hono/http-exception";
import { PodcastLiveStream } from "#/types.ts";
import { getLiveItem, type GetLiveParams, type PodcastLiveItem } from "#/lib/live.ts";
import { cache } from "@hono/hono/cache";

const xata = getXataClient();

const app = new Hono();

// cache
app.get(
	"/feed/*",
	cache({
		cacheName: "podcastlife-feed",
		cacheControl: "max-age=7200",
		wait: true,
	}),
);

app.get(
	"/trending",
	cache({
		cacheName: "podcastlife-trending",
		cacheControl: "max-age=7200",
		wait: true,
	}),
);

app.get(
	"/recent",
	cache({
		cacheName: "podcastlife-recent",
		cacheControl: "max-age=7200",
		wait: true,
	}),
);

app.get(
	"/live",
	cache({
		cacheName: "podcastlife-live",
		cacheControl: "max-age=720",
		wait: true,
	}),
);

/**
 * Get feed detail.
 */
app.get("/feed/:id", async (c) => {
	const { id } = c.req.param();

	const data = await xata.db.podcasts.read(id);

	if (!data || !data.url) {
		return c.notFound();
	}

	const res = await feedParser(data.url);

	if (!res) {
		return c.notFound();
	}

	const { items, podcastLiveItems, ...feed } = res;

	const [description, subtitle, summary] = await Promise.all([
		sanitizeHTML(data.description, []),
		sanitizeHTML(feed.subtitle, []),
		sanitizeHTML(feed.summary, []),
	]);

	const episodeItems: FeedObject["items"] = [];

	const liveItems: FeedObject["podcastLiveItems"] = [];

	for (const item of items) {
		const description = await sanitizeHTML(item.description, []);
		const summary = await sanitizeHTML(item.summary, []);
		const subtitle = await sanitizeHTML(item.subtitle, []);

		episodeItems.push({ ...item, description, summary, subtitle });
	}

	if (podcastLiveItems) {
		for (const item of podcastLiveItems) {
			const description = await sanitizeHTML(item.description, []);

			liveItems.push({ ...item, description });
		}
	}
	logs("get feed detail from : ", id);

	return c.json({
		data: {
			feed: {
				...data,
				description,
				summary,
				subtitle,
				value: feed.value,
				copyright: feed.copyright,
			},
			episodes: episodeItems.map((item) => {
				const season = item.itunesSeason ?? item.podcastSeason?.number;
				const episode = item.itunesEpisode ?? item.podcastEpisode?.number;
				const episodeType = item.itunesEpisodeType;
				const chapters = item.podcastChapters;
				const transcripts = item.podcastTranscripts;
				const people = item.podcastPeople;

				return {
					...item,
					season,
					episode,
					episodeType,
					chapters,
					transcripts,
					people,
				};
			}),
			lives: liveItems,
		},
	});
});

/**
 * Get single episode
 */
app.get("/feed/:id/:guid", async (c) => {
	const { id, guid } = c.req.param();

	const query = {
		guid,
		feedid: id,
		fulltext: "true",
	};

	const data = await podcastApi("/episodes/byguid", query).then((res) => res.json());

	const episode = data.episode;
	const description = await sanitizeHTML(episode.description);

	logs("get episode from ", id, "guid ", guid);

	return c.json({
		data: {
			...episode,
			description,
			explicit: episode.explicit === 0 ? false : true,
			pubDate: episode.datePublished,
			enclosure: {
				url: episode.enclosureUrl,
				length: episode.enclosureLength,
				type: episode.enclosureType,
			},
			image: episode.image ?? episode.feedImage,
			chapters: episode.chaptersUrl,
			value: {
				type: episode.value?.model.type,
				method: episode.value?.model.method,
				suggested: episode.value?.model.suggested,
				recipients: episode.value?.destinations,
			},
		},
	});
});

/**
 * Get trending feeds
 */
app.get("/trending", async (c) => {
	const { max, cat, from, lang } = c.req.query();

	const category = groupingCategories(cat);

	const since = () => {
		switch (from) {
			case "current":
				return Math.floor(Date.now() / 1000) - 1800;
			case "day":
				return Math.floor(Date.now() / 1000) - 86400;
			case "week":
				return Math.floor(Date.now() / 1000) - 604800;
			case "month":
				return Math.floor(Date.now() / 1000) - 2592000;
			default:
				return Math.floor(Date.now() / 1000) - 86400;
		}
	};

	let query = {
		max: max ? max : String(10),
		lang: lang ? language(lang) : language(),
		since: String(since()),
	};

	if (category.length > 0) {
		query = Object.assign(query, { cat: category.toString() });
	}

	const trending = await podcastApi(`/podcasts/trending?`, query);

	if (!trending.ok) {
		errorPodcastApi(trending.status);
	}

	const result = await trending.json();

	// deno-lint-ignore no-explicit-any
	const getPodcasts = result.feeds.map((item: any) => {
		return {
			get: {
				table: "podcasts",
				id: String(item.id),
				columns: [
					"id",
					"title",
					"explicit",
					"author",
					"owner",
					"newestItemPubdate",
					"image",
					"tags",
					"blurhash",
					"hash",
				],
			},
		};
	}) satisfies TransactionOperation<DatabaseSchema, keyof DatabaseSchema>[];

	const fromDB = await xata.transactions.run(getPodcasts).then((res) =>
		res.results //deno-lint-ignore no-explicit-any
			.filter((item: any) => typeof item.columns.id === "string") //deno-lint-ignore no-explicit-any
			.map((item: any) => {
				return item.columns;
			})
	);

	return c.json({ data: fromDB });
});

/**
 * get recents podcast
 */
app.get("/recent", async (c) => {
	const { lang } = c.req.query();

	const languages = language(lang).split(",");

	const recents = await xata.db.podcasts
		.select([
			"id",
			"title",
			"newestItemPubdate",
			"image",
			"explicit",
			"owner",
			"author",
			"blurhash",
			"hash",
		])
		.filter(lang ? { language: { $any: languages } } : undefined)
		.sort("newestItemPubdate", "desc")
		.getPaginated({
			consistency: "eventual",
		});

	const data = recents.records;

	return c.json({ data: data });
});

/**
 * Get live feeds
 */
app.get("/live", async (c) => {
	const res = await podcastApi("/episodes/live", { max: "100" });

	if (!res.ok) {
		throw new HTTPException(500);
	}

	const items = await res.json().then((result) => result.items) as PodcastLiveStream[];

	const liveFromPodcastIndex = items.filter((v) => {
		if (!v.categories || Array.isArray(v.categories)) return false;

		if (v.feedLanguage.includes("en") || v.feedLanguage.includes("in")) return true;
		return false;
	});

	const groupByFeedId = groupBy(liveFromPodcastIndex, (v) => v.feedId);

	const getPodcasts = Array.from(groupByFeedId.keys()).map((v) => {
		return {
			get: {
				table: "podcasts",
				id: String(v),
				columns: ["id", "author", "url"],
			},
		};
	}) satisfies TransactionOperation<DatabaseSchema, keyof DatabaseSchema>[];

	const getFeedsFromDb = await xata.transactions.run(getPodcasts);

	const feeds = getFeedsFromDb.results
		// deno-lint-ignore no-explicit-any
		.filter((item: any) => typeof item.columns.id === "string")
		// deno-lint-ignore no-explicit-any
		.map((item: any) => {
			return item.columns;
		}) as GetLiveParams[];

	let live: PodcastLiveItem[] = [];

	await Promise.all(
		feeds.map((item) =>
			getLiveItem(item).then((res) => {
				if (res) {
					live = live.concat(res);
				}
			})
		),
	);

	return c.json({ data: live });
});

/**
 * Decline method
 */
app.on(["PUT", "DELETE", "OPTIONS", "PATCH", "POST"], "/*", () => {
	throw new HTTPException(405, { message: "Method Not Allowed" });
});

export default app;
