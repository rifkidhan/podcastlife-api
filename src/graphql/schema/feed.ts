const feed = /* GraphQL */ `
	type Feed {
		id: ID!
		podcastGuid: String!
		title: String!
		url: String!
		link: String
		originalUrl: String
		description: String
		author: String
		ownerName: String
		image: String
		contentType: String!
		itunesId: String
		itunesType: String
		generator: String
		language: String!
		explicit: Boolean!
		newestItemPublishTime: String!
		oldestItemPublishTime: String!
		tags: [String]!
		value: Value
	}

	type TrendingFeed {
		id: ID!
		title: String!
		url: String!
		description: String
		author: String
		image: String
		trendScore: Int
		itunesId: String
		language: String!
		newestItemPublishTime: String!
		tags: [String]!
	}
`;

export default feed;
