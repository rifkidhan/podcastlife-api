import { GraphQLError } from "graphql";
import { podcastApi } from "#/models/podcastapi.ts";
import { feedParser } from "#/models/parsefeed.ts";
import { getLiveItem, PodcastLiveItem } from "#/helpers/live.ts";
import { language, groupingCategories, integer } from "#/helpers/matching.ts";
import { PodcastLiveStream } from "#/types.ts";
import { Podcast, podcastDB } from "#/db/deta.ts";
import { Episode } from "https://esm.sh/podcast-partytime@4.7.0";

export type { PodcastLiveItem, Podcast };

export type PodcastFull = {
	data: Podcast;
	episodes: Episode[];
	live?: PodcastLiveItem[];
};

export const getPodcast = async (id: string) => {
	return await podcastDB.get(id);
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

	const items = await feedParser(podcast.url);

	if (!items) {
		throw new GraphQLError("Internal Server Error");
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

	const episode = data.episode;

	return {
		...episode,
		pubDate: episode.datePublished,
		enclosure: {
			url: episode.enclosureUrl,
			length: episode.enclosureLength,
			type: episode.enclosureType,
			image: episode.image ?? episode.feedImage,
			chapters: episode.chaptersUrl,
			value: {
				type: episode.model.type,
				method: episode.model.method,
				suggested: episode.model.suggested,
				recipients: episode.destinations,
			},
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
		throw new GraphQLError("Internal Server Error");
	}

	const result = await trending.json().then((res) => res.feeds);

	return result.map((item: any) => ({
		...item,
		key: item.id,
		imageUrl: item.image,
		tags: Object.entries(item.categories)
			.join()
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
		throw new GraphQLError("Internal Server Error");
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

	const live: PodcastLiveItem[] = [];

	await Promise.all(
		fromIndex.map((item) =>
			getLiveItem(item.feedId).then((res) =>
				res?.map((item) => live.push(item))
			)
		)
	);

	return live;
};
