import { GraphQLError } from "graphql";
import { podcastApi } from "#/models/podcastapi.ts";
import { feedParser } from "#/models/parsefeed.ts";
import { getLiveItem, PodcastLiveItem } from "#/helpers/live.ts";
import { groupingCategories, integer, language } from "#/helpers/matching.ts";
import { PodcastLiveStream } from "#/types.ts";
import { Podcast, podcastDB } from "#/db/deta.ts";
import { Episode } from "https://esm.sh/podcast-partytime@4.7.0";

export type { Podcast, PodcastLiveItem };

export type PodcastFull = {
	data: Podcast;
	episodes: Episode[];
	live?: PodcastLiveItem[];
};

/**
 * get podcasts
 */
export const getPodcasts = async ({
	language,
	tag,
	limit = 50,
	cursor,
}: {
	language?: "en" | "in";
	tag?: string;
	limit?: number;
	cursor?: string;
}) => {
	let query = {};

	if (language) {
		query = Object.assign(query, { "language?contains": language });
	}
	if (tag) {
		query = Object.assign(query, { "tags?contains": tag });
	}

	let podcasts = await podcastDB.fetch(query, { limit });

	if (cursor) {
		podcasts = await podcastDB.fetch(query, { limit, last: cursor });
	}

	return {
		data: podcasts.items,
		info: {
			cursor: podcasts.last,
			count: podcasts.count,
		},
	};
};

export const getPodcastsByCategory = async ({
	category,
	limit = 50,
	language,
	cursor,
}: {
	category: string;
	limit?: number;
	language?: "en" | "in";
	cursor?: string;
}) => {
	const group = groupingCategories(category);

	if (!group) {
		throw new GraphQLError(`category ${category} not found`, {
			extensions: {
				status: 404,
			},
		});
	}

	const parseGroup = group.map((item) => {
		let query = {
			"tags?contains": item,
		};

		if (language) {
			query = Object.assign(query, { "language?contains": language });
		}

		return query;
	});

	let podcasts = await podcastDB.fetch(parseGroup, { limit });

	if (cursor) {
		podcasts = await podcastDB.fetch(parseGroup, { limit, last: cursor });
	}

	return {
		data: podcasts.items,
		info: {
			cursor: podcasts.last,
			count: podcasts.count,
		},
	};
};

/**
 * get feed, episode, and livestream.
 * @param id string
 * @returns
 */
export const getFullPodcast = async (
	id: string
): Promise<{
	data: Podcast;
	episodes: Episode[];
	live?: PodcastLiveItem[];
}> => {
	const podcast = await podcastDB.get(id);

	if (!podcast) {
		throw new GraphQLError(`Podcast with id ${id} not found`, {
			extensions: {
				status: 404,
			},
		});
	}

	const items = await feedParser(podcast.url);

	if (!items) {
		throw new GraphQLError("Internal Server Error", {
			extensions: {
				status: 500,
			},
		});
	}

	return {
		data: {
			...podcast,
			imageUrl: items.image?.url ?? podcast.imageUrl,
			newestItemPublishTime:
				items.newestItemPubDate ?? podcast.newestItemPublishTime,
			value: items.value,
		},
		episodes: items.items,
		live: (items.podcastLiveItems as PodcastLiveItem[]) || undefined,
	};
};

/**
 * get episode metadata
 * @param guid string
 * @param feedId string
 * @returns
 */
export const getEpisode = async (guid: string, feedId: string) => {
	const data = await podcastApi(
		`/episodes/byguid?guid=${guid}&feedid=${feedId}`
	).then((res) => res.json());

	if (!data.status) {
		throw new GraphQLError("Bad request", {
			extensions: {
				status: 400,
			},
		});
	}

	const episode = data.episode;

	return {
		...episode,
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
	};
};

/**
 * get trending podcast from podcastindex
 */
export const getTrending = async ({
	limit = 10,
	cat,
	lang,
	from = "day",
}: {
	limit?: number;
	cat?: string;
	lang?: "en" | "in";
	from?: "current" | "day" | "week" | "month";
}): Promise<Podcast[]> => {
	let url = `/podcasts/trending?max=${limit}&lang=${language(lang)}`;
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

	let categories = "";

	if (cat) {
		const category = groupingCategories(cat);
		if (category) {
			categories = category
				.map((tags) => {
					const firstWord = tags.charAt(0).toUpperCase();
					const rest = tags.slice(1);

					return firstWord + rest;
				})
				.toString();
		}
	}
	if (from) {
		url += "&since=" + since();
	}

	if (categories !== "") {
		url += "&cat=" + categories;
	}

	const trending = await podcastApi(url);

	if (!trending.ok) {
		throw new GraphQLError("Internal Server Error", {
			extensions: {
				status: 500,
			},
		});
	}

	const result = await trending.json().then((res) => res.feeds);

	return result.map((item: any) => ({
		...item,
		tags: Object.entries(item.categories)
			.join()
			.toLowerCase()
			.split(",")
			.filter((n) => integer(n) === false),
	}));
};

/**
 * get livestream podcast
 */
export const getLive = async () => {
	const result = await podcastApi(`/episodes/live?max=100`);

	if (!result.ok) {
		throw new GraphQLError("Internal Server Error", {
			extensions: {
				status: 500,
			},
		});
	}

	const items = await result.json().then((res) => res.items);

	const fromIndex: number[] = [];
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
		if (index.feedLanguage.includes("en" || "in") && index.categories) {
			fromIndex.push(index.feedId);
		}
	}

	let live: PodcastLiveItem[] = [];

	await Promise.all(
		fromIndex.map((item) =>
			getLiveItem(item).then((res) => {
				if (res) {
					live = live.concat(res);
				}
			})
		)
	);

	return live;
};
