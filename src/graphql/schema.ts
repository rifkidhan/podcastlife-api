import {
	GraphQLBoolean,
	GraphQLEnumType,
	GraphQLID,
	GraphQLInt,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLString,
} from "graphql";
import {
	Episode,
	Phase1Transcript,
} from "https://esm.sh/podcast-partytime@4.7.0";
import { integer } from "#/helpers/matching.ts";
import {
	AlternativeEnclosureFragment,
	EnclosureFragment,
	EpisodeType,
	ImagesFragment,
	PersonFragment,
	ValueFragment,
	PageInfoFragment,
} from "./fragments.ts";
import { EnumLanguage, EnumCategory } from "./Enum.ts";

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

type Query = {
	podcastInfo: Podcast;
	live: PodcastLiveItem[];
	trending: Omit<Podcast, "podcastGuid">;
	episode: Episode;
	podcast: {
		data: Podcast;
		episodes: Episode[];
		live?: PodcastLiveItem;
	};
	podcasts: {
		data: Podcast[];
		info: {
			cursor?: string;
			count: number;
		};
	};
};

const podcast = new GraphQLObjectType<Podcast>({
	name: "Feed",
	fields: {
		id: {
			type: GraphQLID,
			resolve: (root) => root.key,
		},
		podcastGuid: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.podcastGuid,
		},
		title: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.title,
		},
		url: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.url,
		},
		link: {
			type: GraphQLString,
			resolve: (root) => root.link,
		},
		originalUrl: {
			type: GraphQLString,
			resolve: (root) => root.originalUrl,
		},
		description: {
			type: GraphQLString,
			resolve: (root) => root.description,
		},
		author: {
			type: GraphQLString,
			resolve: (root) => root.author,
		},
		ownerName: {
			type: GraphQLString,
			resolve: (root) => root.ownerName,
		},
		image: {
			type: GraphQLString,
			resolve: (root) => root.imageUrl,
		},
		contentType: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.contentType,
		},
		itunesId: {
			type: GraphQLString,
			resolve: (root) => root.itunesId,
		},
		itunesType: {
			type: GraphQLString,
			resolve: (root) => root.itunesType,
		},
		generator: {
			type: GraphQLString,
			resolve: (root) => root.generator,
		},
		language: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.language,
		},
		explicit: {
			type: new GraphQLNonNull(GraphQLBoolean),
			resolve: (root) => root.explicit,
		},
		newestItemPublishTime: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.newestItemPublishTime,
		},
		oldestItemPublishTime: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.oldestItemPublishTime,
		},
		tags: {
			type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
			resolve: (root) => root.tags.filter((n) => integer(n) === false),
		},
		value: {
			type: ValueFragment,
			resolve: (root) => root.value,
		},
	},
});

const episode = new GraphQLObjectType<
	Episode & { feedId: string; feedTitle: string }
>({
	name: "Episode",
	fields: {
		title: {
			type: GraphQLString,
			resolve: (root) => root.title,
		},
		feedId: {
			type: GraphQLString,
			resolve: (root) => root.feedId,
		},
		feedTitle: {
			type: GraphQLString,
			resolve: (root) => root.feedTitle,
		},
		guid: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.guid,
		},
		link: {
			type: GraphQLString,
			resolve: (root) => root.link,
		},
		author: {
			type: GraphQLString,
			resolve: (root) => root.author,
		},
		explicit: {
			type: new GraphQLNonNull(GraphQLBoolean),
			resolve: (root) => root.explicit,
		},
		enclosure: {
			type: new GraphQLNonNull(EnclosureFragment),
			resolve: (root) => root.enclosure,
		},
		episode: {
			type: GraphQLInt,
			resolve: (root) => root.podcastEpisode?.number ?? root.itunesEpisode,
		},
		episodeType: {
			type: EpisodeType,
			resolve: (root) => root.itunesEpisodeType,
		},
		duration: {
			type: new GraphQLNonNull(GraphQLInt),
			resolve: (root) => root.duration,
		},
		description: {
			type: GraphQLString,
			resolve: (root) => root.description,
		},
		image: {
			type: GraphQLString,
			resolve: (root) => root.image ?? root.itunesImage,
		},
		pubDate: {
			type: GraphQLInt,
			resolve: (root) => root.pubDate,
		},
		summary: {
			type: GraphQLString,
			resolve: (root) => root.summary,
		},
		content: {
			type: GraphQLString,
			resolve: (root) => root.content,
		},
		subtitle: {
			type: GraphQLString,
			resolve: (root) => root.subtitle,
		},
		season: {
			type: GraphQLInt,
			resolve: (root) => root.podcastSeason?.number ?? root.itunesSeason,
		},
		altEnclosures: {
			type: new GraphQLList(AlternativeEnclosureFragment),
			resolve: (root) => root.alternativeEnclosures,
		},
		keywords: {
			type: new GraphQLList(GraphQLString),
			resolve: (root) => root.keywords,
		},
		chapters: {
			type: GraphQLString,
			resolve: (root) => root.podcastChapters?.url,
		},
		transcripts: {
			type: new GraphQLList(
				new GraphQLObjectType<Phase1Transcript>({
					name: "Transcript",
					fields: {
						url: {
							type: new GraphQLNonNull(GraphQLString),
							resolve: (root) => root.url,
						},
						type: {
							type: new GraphQLNonNull(GraphQLString),
							resolve: (root) => root.type,
						},
					},
				})
			),
			resolve: (root) => root.podcastTranscripts,
		},
		value: {
			type: ValueFragment,
			resolve: (root) => root.value,
		},
		persons: {
			type: new GraphQLList(PersonFragment),
			resolve: (root) => root.podcastPeople,
		},
		podcastImages: {
			type: new GraphQLList(ImagesFragment),
			resolve: (root) => root.podcastImages,
		},
	},
});

const live = new GraphQLObjectType<PodcastLiveItem>({
	name: "Live",
	fields: {
		feedId: {
			type: GraphQLString,
			resolve: (root) => root.feedId,
		},
		feedTitle: {
			type: GraphQLString,
			resolve: (root) => root.feedTitle,
		},
		guid: {
			type: GraphQLString,
			resolve: (root) => root.guid,
		},
		title: {
			type: GraphQLString,
			resolve: (root) => root.title,
		},
		start: {
			type: new GraphQLNonNull(GraphQLInt),
			resolve: (root) => root.start,
		},
		end: {
			type: GraphQLInt,
			resolve: (root) => root.end,
		},
		link: {
			type: GraphQLString,
			resolve: (root) => root.link,
		},
		status: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.status,
		},
		image: {
			type: GraphQLString,
			resolve: (root) => root.image,
		},
		enclosure: {
			type: new GraphQLNonNull(EnclosureFragment),
			resolve: (root) => root.enclosure,
		},
		author: {
			type: GraphQLString,
			resolve: (root) => root.author,
		},
		description: {
			type: GraphQLString,
			resolve: (root) => root.description,
		},
		value: {
			type: ValueFragment,
			resolve: (root) => root.value,
		},
		persons: {
			type: new GraphQLList(PersonFragment),
			resolve: (root) => root.podcastPeople,
		},
		podcastImages: {
			type: new GraphQLList(ImagesFragment),
			resolve: (root) => root.podcastImages,
		},
		altEnclosures: {
			type: new GraphQLList(AlternativeEnclosureFragment),
			resolve: (root) => root.alternativeEnclosures,
		},
	},
});

const trending = new GraphQLObjectType({
	name: "TrendingFeed",
	fields: {
		id: {
			type: new GraphQLNonNull(GraphQLID),
			resolve: (root) => root.id,
		},
		title: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.title,
		},
		url: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.url,
		},
		description: {
			type: GraphQLString,
			resolve: (root) => root.description,
		},
		author: {
			type: GraphQLString,
			resolve: (root) => root.author,
		},
		image: {
			type: GraphQLString,
			resolve: (root) => root.image,
		},
		trendScore: {
			type: GraphQLInt,
			resolve: (root) => root.trendScore,
		},
		itunesId: {
			type: GraphQLString,
			resolve: (root) => root.itunesId,
		},
		language: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.language,
		},
		newestItemPublishTime: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.newestItemPublishTime,
		},
		tags: {
			type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
			resolve: (root) => root.tags,
		},
	},
});

const podcastsList = new GraphQLObjectType<{
	data: Podcast[];
	info: {
		cursor?: string;
		count: number;
	};
}>({
	name: "Podcasts",
	fields: {
		data: {
			type: new GraphQLList(podcast),
			resolve: (parent) => parent.data,
		},
		info: {
			type: new GraphQLNonNull(PageInfoFragment),
			resolve: (parent) => parent.info,
		},
	},
});

const QueryRoot = new GraphQLObjectType<Query>({
	name: "Query",
	fields: {
		podcast: {
			type: new GraphQLObjectType<{
				data: Podcast;
				episodes: Episode[];
				live?: PodcastLiveItem[];
			}>({
				name: "Podcast",
				fields: {
					data: {
						type: new GraphQLNonNull(podcast),
						resolve: (parent) => parent.data,
					},
					episodes: {
						type: new GraphQLNonNull(new GraphQLList(episode)),
						resolve: (parent) => parent.episodes,
					},
					live: {
						type: new GraphQLList(live),
						resolve: (parent) => parent.live,
					},
				},
			}),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLID),
				},
			},
			resolve: (_, args: { id: string }) => {
				const { id } = args;
				return getFullPodcast(id);
			},
			description: "Get podcast data including episodes and livestreams",
		},
		podcasts: {
			type: podcastsList,
			args: {
				limit: {
					type: GraphQLInt,
				},
				tag: {
					type: GraphQLString,
				},
				language: {
					type: EnumLanguage,
				},
				cursor: {
					type: GraphQLString,
				},
			},
			resolve: (
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
			description: "fetch podcasts",
		},
		podcastByCategory: {
			type: podcastsList,
			args: {
				limit: {
					type: GraphQLInt,
				},
				category: {
					type: new GraphQLNonNull(EnumCategory),
				},
				language: {
					type: EnumLanguage,
				},
				cursor: {
					type: GraphQLString,
				},
			},
			resolve: (
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
		},
		live: {
			type: new GraphQLNonNull(new GraphQLList(live)),
			resolve: () => getLive(),
			description: "Get livestream podcast",
		},
		trending: {
			type: new GraphQLNonNull(new GraphQLList(trending)),
			args: {
				limit: {
					type: GraphQLInt,
				},
				category: {
					type: EnumCategory,
				},
				language: {
					type: EnumLanguage,
				},
				since: {
					type: new GraphQLEnumType({
						name: "EnumSince",
						values: {
							CURRENT: {
								value: "current",
							},
							DAY: {
								value: "day",
							},
							WEEK: {
								value: "week",
							},
							MONTH: {
								value: "month",
							},
						},
					}),
				},
			},
			resolve: (
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
			description: "Get trending podcast from PodcastIndex",
		},
		episode: {
			type: episode,
			args: {
				guid: {
					type: new GraphQLNonNull(GraphQLString),
				},
				feedId: {
					type: new GraphQLNonNull(GraphQLID),
				},
			},
			resolve: (_, args: { guid: string; feedId: string }) => {
				const { guid, feedId } = args;

				return getEpisode(guid, feedId);
			},
			description:
				"Get episode metadata from id podcast(feedId) and episode guid",
		},
	},
});

const schema = new GraphQLSchema({
	query: QueryRoot,
});

export default schema;
