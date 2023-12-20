export const integer = (param: string): boolean => {
	const reg = /^\d+$/;

	return reg.test(param);
};

export const language = (search?: string) => {
	switch (search) {
		case "en":
			return "en,en-au,en-bz,en-ca,en-ie,en-jm,en-nz,en-ph,en-za,en-tt,en-gb,en-us,en-zw";
		case "in":
			return "in";
		default:
			return "in,en,en-au,en-bz,en-ca,en-ie,en-jm,en-nz,en-ph,en-za,en-tt,en-gb,en-us,en-zw";
	}
};

export const groupingCategories = (arg: string) => {
	switch (arg) {
		case "arts":
			return ["arts", "design", "visual", "beauty"];

		case "business":
			return [
				"business",
				"careers",
				"entrepreneurship",
				"investing",
				"management",
				"marketing",
				"non-profit",
			];
		case "comedy":
			return ["comedy", "stand-up"];
		case "education":
			return [
				"education",
				"courses",
				"how-to",
				"language",
				"learning",
				"self-improvement",
			];
		case "fiction":
			return ["fiction", "drama"];
		case "history":
			return ["history"];
		case "health-fitness":
			return ["health", "fitness", "mental"];
		case "kids-family":
			return ["kids", "family", "parenting", "pets", "animals", "stories"];
		case "leisure":
			return [
				"leisure",
				"automotive",
				"aviation",
				"crafts",
				"hobbies",
				"home",
				"garden",
			];
		case "music":
			return ["music"];
		case "news":
			return ["news", "daily", "entertainment"];
		case "politics":
			return ["government", "politics"];
		case "science":
			return ["science"];
		case "society-culture":
			return ["society", "culture"];
		case "sports":
			return ["sports"];
		case "technology":
			return ["technology"];
		case "true-crime":
			return ["true crime"];
		case "tv-film":
			return ["tv", "film", "after-shows", "reviews"];
		default:
			return undefined;
	}
};
