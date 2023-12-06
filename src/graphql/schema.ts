import {
	GraphQLSchema,
	GraphQLString,
	GraphQLObjectType,
	GraphQLID,
	GraphQLNonNull,
	GraphQLBoolean,
} from "graphql";
import { Podcast, podcastDB } from "#/db/deta.ts";

type Query = {
	podcast: Podcast;
};

const podcast = new GraphQLObjectType<Podcast>({
	name: "podcast",
	fields: {
		key: {
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
		imageUrl: {
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
	},
});

const QueryRoot = new GraphQLObjectType<Query>({
	name: "Query",
	fields: {
		podcast: {
			type: podcast,
			args: {
				key: {
					type: GraphQLID,
				},
			},
			resolve: (_, args: { key: string }) => {
				const { key } = args;

				return podcastDB.get(key);
			},
			description: "Get Podcast By Id",
		},
	},
});

const schema = new GraphQLSchema({
	query: QueryRoot,
});

export default schema;
