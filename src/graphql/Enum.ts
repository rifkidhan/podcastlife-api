import { GraphQLEnumType } from "graphql";

export const EnumCategory = new GraphQLEnumType({
	name: "EnumCategory",
	values: {
		ARTS: {
			value: "arts",
		},
		BUSINESS: {
			value: "business",
		},
		COMEDY: {
			value: "comedy",
		},
		EDUCATION: {
			value: "education",
		},
		FICTION: {
			value: "fiction",
		},
		HISTORY: {
			value: "history",
		},
		HEALTH_FITNESS: {
			value: "health-fitness",
		},
		KIDS_FAMILY: {
			value: "kids-family",
		},
		LEISURE: {
			value: "leisure",
		},
		MUSIC: {
			value: "music",
		},
		NEWS: {
			value: "news",
		},
		POLITICS: {
			value: "politics",
		},
		SCIENCE: {
			value: "science",
		},
		SOCIETY_CULTURE: {
			value: "society-culture",
		},
		SPORTS: {
			value: "sports",
		},
		TECHNOLOGY: {
			value: "technology",
		},
		TRUE_CRIME: {
			value: "true-crime",
		},
		TV_FILM: {
			value: "tv-film",
		},
	},
	description:
		"Enum category. Simplify categories from PodcastIndex categories",
});

export const EnumLanguage = new GraphQLEnumType({
	name: "EnumLanguage",
	values: {
		EN: {
			value: "en",
		},
		IN: {
			value: "in",
		},
	},
	description:
		"enum language, en for English (en, en-US, en-GB, etc.) and in for Indonesia",
});
