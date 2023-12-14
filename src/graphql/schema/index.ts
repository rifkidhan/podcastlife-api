import items from "./items.ts";
import {
	value,
	person,
	podcastImage,
	transcript,
	alternativeEnclosure,
	enclosure,
} from "./fragments.ts";
import feed from "./feed.ts";
import {
	EnumSince,
	EnumCategory,
	EnumLanguage,
	EpisodeTypeEnum,
} from "./enum.ts";

const root = /* GraphQL */ `
	schema {
		query: Query
	}

	type Query {
		"""
		Get podcast data including episodes and livestreams.
		"""
		podcast(id: ID!): Podcast
		"""
		Get trending podcast from PodcastIndex.
		"""
		trending(
			limit: Int
			category: Category
			language: Language
			since: Since
		): [TrendingFeed]!
		"""
		Get livestream podcast.
		"""
		live: [Live]!
		"""
		Get all podcasts. Filter using language and tag.
		"""
		podcasts(
			limit: Int
			tag: String
			language: Language
			cursor: String
		): Podcasts
		"""
		Get podcasts by category.
		"""
		podcastsByCategory(
			limit: Int
			category: Category!
			language: Language
			cursor: String
		): Podcasts
		"""
		Get single episode metadata using id podcast(feedId) and episode guid.
		"""
		episode(guid: String!, feedId: ID!): Item
	}

	type Podcast {
		data: Feed!
		episodes: [Episode]!
		live: [Live]
	}

	type Podcasts {
		data: [Feed]
		info: PageInfo!
	}

	type PageInfo {
		count: Int!
		endCursor: String
	}
`;

const allTypeDefs = [
	root,
	feed,
	items,
	enclosure,
	value,
	person,
	podcastImage,
	alternativeEnclosure,
	transcript,
	EnumCategory,
	EnumLanguage,
	EnumSince,
	EpisodeTypeEnum,
];

export default allTypeDefs;
