const recipient = /* GraphQL */ `
	type Recipient {
		name: String
		customKey: String
		customValue: String
		type: String!
		address: String!
		split: Int!
		fee: Boolean
	}
`;

export const enclosure = /* GraphQL */ `
	type Enclosure {
		url: String!
		type: String!
		length: Int!
	}
`;

export const value = /* GraphQL */ `
	type Value {
		type: String
		method: String
		recipients: [Recipient]
		suggested: String
	}
	${recipient}
`;

export const person = /* GraphQL */ `
	type Person {
		group: String
		href: String
		img: String
		name: String!
		role: String
	}
`;

export const podcastImage = /* GraphQL */ `
	type ParsedImageUrl {
		url: String!
	}

	type ParsedImageWidth {
		url: String!
		width: Int!
	}

	type ParsedImageDensity {
		url: String!
		density: Int!
	}

	union ParsedImage = ParsedImageUrl | ParsedImageWidth | ParsedImageDensity

	type PodcastImage {
		parsed: ParsedImage!
		raw: String!
	}
`;

export const transcript = /* GraphQL */ `
	type Transcript {
		type: String!
		url: String!
		language: String
	}
`;

export const alternativeEnclosure = /* GraphQL */ `
	type AlternativeEnclosureSource {
		contentType: String!
		uri: String!
	}

	type AlternativeEnclosure {
		title: String
		type: String!
		length: Int!
		source: [AlternativeEnclosureSource]
		bitrate: Int
		codecs: String
		default: Boolean!
		height: Int
		lang: String
		rel: String
	}
`;
