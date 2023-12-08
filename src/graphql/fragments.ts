import {
	GraphQLString,
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLBoolean,
	GraphQLList,
	GraphQLInt,
	GraphQLEnumType,
} from "graphql";

import {
	Enclosure,
	Phase4Value,
	Phase4ValueRecipient,
	Phase2Person,
	Phase3AltEnclosure,
} from "https://esm.sh/podcast-partytime@4.7.0";

type PodcastImage = {
	raw: string;
	parsed: {
		url: string;
	};
};

export const EpisodeType = new GraphQLEnumType({
	name: "EpisodeType",
	values: {
		FULL: {
			value: "full",
		},
		TRAILER: {
			value: "trailer",
		},
		BONUS: {
			value: "bonus",
		},
	},
});

export const AlternativeEnclosureFragment =
	new GraphQLObjectType<Phase3AltEnclosure>({
		name: "AlternativeEnclosure",
		fields: {
			source: {
				type: new GraphQLList(
					new GraphQLObjectType<{ uri: string; contentType: string }>({
						name: "AlternativeEnclosureSource",
						fields: {
							uri: {
								type: new GraphQLNonNull(GraphQLString),
								resolve: (root) => root.uri,
							},
							contentType: {
								type: new GraphQLNonNull(GraphQLString),
								resolve: (root) => root.contentType,
							},
						},
					})
				),
			},
			type: {
				type: new GraphQLNonNull(GraphQLString),
				resolve: (root) => root.type,
			},
			length: {
				type: new GraphQLNonNull(GraphQLInt),
				resolve: (root) => root.length,
			},
			default: {
				type: new GraphQLNonNull(GraphQLBoolean),
				resolve: (root) => root.default,
			},
			bitrate: {
				type: GraphQLInt,
				resolve: (root) => root.bitrate,
			},
			height: {
				type: GraphQLInt,
				resolve: (root) => root.height,
			},
			lang: {
				type: GraphQLString,
				resolve: (root) => root.lang,
			},
			title: {
				type: GraphQLString,
				resolve: (root) => root.title,
			},
			rel: {
				type: GraphQLString,
				resolve: (root) => root.rel,
			},
			codecs: {
				type: GraphQLString,
				resolve: (root) => root.codecs,
			},
		},
	});

export const ImagesFragment = new GraphQLObjectType<PodcastImage>({
	name: "PodcastImage",
	fields: {
		raw: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.raw,
		},
		parsed: {
			type: new GraphQLNonNull(
				new GraphQLObjectType<{
					url: string;
				}>({
					name: "PodcastImageUrlOnly",
					fields: {
						url: {
							type: new GraphQLNonNull(GraphQLString),
							resolve: (root) => root.url,
						},
					},
				})
			),
		},
	},
});

export const PersonFragment = new GraphQLObjectType<Phase2Person>({
	name: "Person",
	fields: {
		name: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.name,
		},
		role: {
			type: GraphQLString,
			resolve: (root) => root.name,
		},
		group: {
			type: GraphQLString,
			resolve: (root) => root.group,
		},
		img: {
			type: GraphQLString,
			resolve: (root) => root.img,
		},
		href: {
			type: GraphQLString,
			resolve: (root) => root.href,
		},
	},
});

export const RecipientFragment = new GraphQLObjectType<Phase4ValueRecipient>({
	name: "Recipient",
	fields: {
		name: {
			type: GraphQLString,
			resolve: (root) => root.name,
		},
		customKey: {
			type: GraphQLString,
			resolve: (root) => root.customKey,
		},
		customValue: {
			type: GraphQLString,
			resolve: (root) => root.customValue,
		},
		type: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.type,
		},
		address: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.address,
		},
		split: {
			type: new GraphQLNonNull(GraphQLInt),
			resolve: (root) => root.split,
		},
		fee: {
			type: new GraphQLNonNull(GraphQLBoolean),
			resolve: (root) => root.fee,
		},
	},
});

export const ValueFragment = new GraphQLObjectType<Phase4Value>({
	name: "Value",
	fields: {
		type: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.type,
		},
		method: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.method,
		},
		recipients: {
			type: new GraphQLList(RecipientFragment),
			resolve: (root) => root.recipients,
		},
		suggested: {
			type: GraphQLString,
			resolve: (root) => root.suggested,
		},
	},
});

export const EnclosureFragment = new GraphQLObjectType<Enclosure>({
	name: "Enclosure",
	fields: {
		url: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.url,
		},
		length: {
			type: new GraphQLNonNull(GraphQLInt),
			resolve: (root) => root.length,
		},
		type: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: (root) => root.type,
		},
	},
});
