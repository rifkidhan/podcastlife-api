import { Podcast } from "../podcast.ts";
import { integer } from "#/helpers/matching.ts";

type TrendingFeed = Pick<
	Podcast,
	| "author"
	| "title"
	| "tags"
	| "description"
	| "itunesId"
	| "language"
	| "url"
	| "newestItemPublishTime"
> & {
	id: string;
	image: string;
	trendScore: number;
};

const feed = {
	Feed: {
		id: (root: Podcast) => root.key,
		podcastGuid: (root: Podcast) => root.podcastGuid,
		title: (root: Podcast) => root.title,
		url: (root: Podcast) => root.url,
		link: (root: Podcast) => root.link,
		originalUrl: (root: Podcast) => root.originalUrl,
		description: (root: Podcast) => root.description,
		author: (root: Podcast) => root.author,
		ownerName: (root: Podcast) => root.ownerName,
		image: (root: Podcast) => root.imageUrl,
		contentType: (root: Podcast) => root.contentType,
		itunesId: (root: Podcast) => root.itunesId,
		itunesType: (root: Podcast) => root.itunesType,
		generator: (root: Podcast) => root.generator,
		language: (root: Podcast) => root.language,
		explicit: (root: Podcast) => root.explicit,
		newestItemPublishTime: (root: Podcast) => root.newestItemPublishTime,
		oldestItemPublishTime: (root: Podcast) => root.oldestItemPublishTime,
		tags: (root: Podcast) => root.tags.filter((n) => integer(n) === false),
		value: (root: Podcast) => root.value,
	},
	TrendingFeed: {
		id: (root: TrendingFeed) => root.id,
		title: (root: TrendingFeed) => root.title,
		url: (root: TrendingFeed) => root.url,
		description: (root: TrendingFeed) => root.description,
		author: (root: TrendingFeed) => root.author,
		image: (root: TrendingFeed) => root.image,
		itunesId: (root: TrendingFeed) => root.itunesId,
		language: (root: TrendingFeed) => root.language,
		newestItemPublishTime: (root: TrendingFeed) => root.newestItemPublishTime,
		trendScore: (root: TrendingFeed) => root.trendScore,
		tags: (root: TrendingFeed) => root.tags.filter((n) => integer(n) === false),
	},
};

export default feed;
