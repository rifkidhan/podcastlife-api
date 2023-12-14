const items = /* GraphQL */ `
	interface Item {
		feedId: String
		feedTitle: String
		guid: String
		title: String
		link: String
		image: String
		enclosure: Enclosure!
		author: String
		description: String
		value: Value
	}
	type Episode implements Item {
		title: String
		feedId: String
		feedTitle: String
		guid: String!
		link: String
		author: String
		explicit: Boolean!
		enclosure: Enclosure!
		episode: Int
		episodeType: EpisodeType
		duration: Int!
		description: String
		image: String
		pubDate: String
		summary: String
		content: String
		subtitle: String
		season: Int
		altEnclosures: [AlternativeEnclosure]
		keywords: [String]
		chapters: String
		transcripts: [Transcript]
		value: Value
		persons: [Person]
		podcastImages: [PodcastImage]
	}

	type Live implements Item {
		feedId: String
		feedTitle: String
		guid: String
		title: String
		start: String!
		end: String
		link: String
		status: String!
		image: String
		enclosure: Enclosure!
		author: String
		description: String
		value: Value
		persons: [Person]
		podcastImages: [PodcastImage]
		altEnclosures: [AlternativeEnclosure]
	}
`;

export default items;
