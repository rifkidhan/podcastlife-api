export const integer = (param: string): boolean => {
	const reg = /^\d+$/;

	return reg.test(param);
};

export const language = (search?: string) => {
	switch (search) {
		case "en":
			return "en,en-au,en-bz,en-ca,en-ie,en-jm,en-nz,en-ph,en-za,en-tt,en-gb,en-us,en-zw";
		case "id":
			return "in";
		default:
			return "in,en,en-au,en-bz,en-ca,en-ie,en-jm,en-nz,en-ph,en-za,en-tt,en-gb,en-us,en-zw";
	}
};

export const groupingCategories = (arg: string) => {
	switch (arg) {
		case "arts":
			return [
				"arts",
				"design",
				"visual",
				"beauty",
				"books",
				"fashion",
				"food",
				"performing",
			];

		case "business":
			return [
				"business",
				"careers",
				"entrepreneurship",
				"investing",
				"management",
				"marketing",
				"non-profit",
				"cryptocurrency",
			];
		case "comedy":
			return ["comedy", "stand-up", "interviews", "improv"];
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
			return [
				"health",
				"fitness",
				"mental",
				"alternative",
				"medicine",
				"nutrition",
				"sexuality",
			];
		case "kids-family":
			return [
				"kids",
				"family",
				"parenting",
				"pets",
				"animals",
				"stories",
			];
		case "leisure":
			return [
				"leisure",
				"automotive",
				"aviation",
				"crafts",
				"hobbies",
				"home",
				"garden",
				"game",
				"video-games",
			];
		case "music":
			return ["music", "commentary"];
		case "news":
			return ["news", "daily", "entertainment"];
		case "politics":
			return ["government", "politics"];
		case "spiritual":
			return [
				"buddhism",
				"christianity",
				"hinduism",
				"islam",
				"judaism",
				"religion",
				"spirituality",
			];
		case "science":
			return [
				"science",
				"astronomy",
				"chemistry",
				"earth",
				"life",
				"mathematics",
				"natural",
				"nature",
				"physics",
			];
		case "society-culture":
			return [
				"society",
				"culture",
				"social",
				"documentary",
				"personal",
				"journals",
				"philosophy",
				"places",
				"travel",
				"relationships",
			];
		case "sports":
			return [
				"sports",
				"baseball",
				"basketball",
				"cricket",
				"fantasy",
				"football",
				"golf",
				"hockey",
				"rugby",
				"running",
				"soccer",
				"swimming",
				"tennis",
				"volleyball",
				"wilderness",
				"wrestling",
			];
		case "technology":
			return ["technology"];
		case "true-crime":
			return ["true crime"];
		case "tv-film":
			return [
				"tv",
				"film",
				"after-shows",
				"reviews",
				"animation",
				"manga",
				"climate",
				"weather",
				"tabletop",
				"role-playing",
			];
		default:
			return [];
	}
};
