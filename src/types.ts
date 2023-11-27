export interface PodcastInfo {
	key: string;
	id: number;
	podcastGuid: string;
	title: string;
	url: string;
	link: string;
	description: string;
	author: string;
	ownerName: string;
	image: string;
	artwork: string;
	lastUpdateTime: number;
	lastCrawlTime: number;
	lastParseTime: number;
	lastGoodHttpStatusTime: number;
	lastHttpStatus: number;
	contentType: string;
	itunesId: number | null;
	itunesType: string | null;
	generator?: string;
	language?: string;
	explicit: boolean;
	type: number;
	dead: number;
	chash: string;
	episodeCount: number;
	crawlErrors: number;
	parseErrors: number;
	categories: {
		[key: string]: string;
	};
	locked: number;
	imageUrlHash: number;
	value?: {
		model: {
			type: string;
			method: string;
			suggested: string;
		};
		destinations: {
			name: string;
			address: string;
			type: string;
			split: number;
			fee?: boolean;
			customKey?: string;
			customValue?: string;
		}[];
	};
	funding?: {
		message: string;
		url: string;
	};
}

type TrendingFeed = Pick<
	PodcastInfo,
	| "id"
	| "artwork"
	| "author"
	| "categories"
	| "description"
	| "image"
	| "itunesId"
	| "language"
	| "title"
	| "url"
> & {
	trendScore: number;
	newestItemPublishTime: number;
};

export interface TrendingPodcast {
	status: string;
	feeds: TrendingFeed[];
	count: number;
	max: number;
	since: number;
	description: string;
}

export interface Episodes {
	id: number;
	guid: string;
	title: string;
	link: string;
	datePublished: number;
	datePublishedPretty: string;
	dateCrawled: number;
	enclosureUrl: string;
	enclosureType: string;
	enclosureLength: number;
	explicit: number;
	image: string;
	feedItunesId: number;
	feedImage: string;
	feedId: number;
	feedLanguage: string;
}

export type PodcastLiveInfo = Episodes & {
	description: string;
	startTime: number;
	endTime: number;
	status: string;
	contentLink?: string;
	duration: number;
	explicit: number;
	episode?: number | null;
	episodeType: "full" | "trailer" | "bonus";
	season?: number | null;
	feedDead: number;
	feedDuplicateOf?: number | null;
	chaptersUrl?: string | null;
	transcriptUrl?: string | null;
};

export type PodcastEpisodeInfo = Episodes & {
	description: string;
	startTime: number;
	endTime: number;
	duration: number;
	episode?: number | null;
	episodeType: "full" | "trailer" | "bonus";
	season?: number | null;
	feedDead: number;
	feedDuplicateOf?: number | null;
	chaptersUrl?: string | null;
	transcriptUrl?: string | null;
	transcripts?: {
		url: string;
		type:
			| "application/json"
			| "application/srt"
			| "text/html"
			| "text/plain"
			| "text/srt"
			| "text/vtt";
	}[];
	soundbites?: {
		startTime: number;
		duration: number;
		title: string;
	}[];
	persons?: {
		id: number;
		name: string;
		role?: string;
		group?: string;
		href?: string;
		img?: string;
	}[];
	socialInteract?: {
		url: string;
		protocol: "disabled" | "activitypub" | "twitter" | "lightning";
		accountId: string;
		accountUrl: string;
		priority: number;
	}[];
	value?: {
		model: {
			type: string;
			method: string;
			suggested: string;
		};
		destinations: {
			name: string;
			address: string;
			type: string;
			split: number;
			fee?: boolean;
			customKey?: string;
			customValue?: string;
		}[];
	};
};

export type PodcastLiveStream = Episodes & {
	categories: {
		[key: string]: string;
	};
};
