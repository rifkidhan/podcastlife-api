import { Episode } from "https://esm.sh/podcast-partytime@4.7.0";
import { createSchema } from "graphql-yoga";
import allTypeDefs from "./schema/index.ts";
import {
	categoryResolver,
	languageResolver,
	sinceResolver,
	episodeTypeResolver,
} from "./resolver/enum.ts";
import fragments from "./resolver/fragments.ts";
import feed from "./resolver/feed.ts";
import items from "./resolver/items.ts";

import {
	getEpisode,
	getFullPodcast,
	getLive,
	getPodcasts,
	getTrending,
	Podcast,
	PodcastLiveItem,
	getPodcastsByCategory,
} from "./podcast.ts";

interface Podcasts {
	data: Podcast[];
	info: {
		cursor?: string;
		count: number;
	};
}
interface PodcastType {
	data: Podcast;
	episodes: Episode[];
	live?: PodcastLiveItem[];
}

export const schema = createSchema({
	typeDefs: allTypeDefs,
	resolvers: [
		{
			Category: categoryResolver,
			Language: languageResolver,
			Since: sinceResolver,
			EpisodeType: episodeTypeResolver,
			Query: {
				podcast: (_, args: { id: string }) => {
					return getFullPodcast(args.id);
				},
				podcasts: (
					_,
					args: {
						limit?: number;
						tag?: string;
						language?: "en" | "in";
						cursor?: string;
					}
				) => {
					const { limit, tag, language, cursor } = args;

					return getPodcasts({ language, tag, limit, cursor });
				},
				podcastsByCategory: (
					_,
					args: {
						limit?: number;
						category: string;
						language?: "en" | "in";
						cursor?: string;
					}
				) => {
					const { limit, category, language, cursor } = args;

					return getPodcastsByCategory({ limit, category, language, cursor });
				},
				live: (_) => {
					return getLive();
				},
				trending: (
					_,
					args: {
						limit?: number;
						category?: string;
						language?: "en" | "in";
						since?: "current" | "day" | "week" | "month";
					}
				) => {
					const { limit, since, category, language } = args;

					return getTrending({
						limit,
						from: since,
						cat: category,
						lang: language,
					});
				},
				episode: (_, args: { guid: string; feedId: string }) => {
					const { guid, feedId } = args;

					return getEpisode(guid, feedId);
				},
			},
			Podcasts: {
				data: (parent: Podcasts) => parent.data,
				info: (parent: Podcasts) => parent.info,
			},
			Podcast: {
				data: (parent: PodcastType) => parent.data,
				episodes: (parent: PodcastType) => parent.episodes,
				live: (parent: PodcastType) => parent.live,
			},
			Item: {
				__resolveType: (root: any) => {
					if (root.duration) {
						return "Episode";
					} else {
						return "Live";
					}
				},
			},
			PodcastImage: {
				raw: (root: any) => root.raw,
				parsed: {
					__resolveType: (root: any) => {
						if (root.parsed.width) {
							return "ParsedImageWidth";
						}
						if (root.parsed.density) {
							return "ParsedImageDensity";
						} else {
							return "ParsedImageUrl";
						}
					},
				},
			},
		},
		feed,
		fragments,
		items,
	],
});

export default schema;
