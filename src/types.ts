export interface PodcastInfo {
	key: string;
	id: number;
	podcastGuid: string;
	title: string;
	url: string;
	link: string;
	originalUrl: string;
	description: string;
	author: string;
	ownerName: string;
	image: string;
	artwork: string;
	lastUpdateTime: number;
	contentType: string;
	itunesId?: number;
	itunesType?: string;
	language: string;
	explicit: boolean;
	generator?: string;
	type: number;
	categories: {
		[key: string]: string;
	};
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

export type PodcastLiveStream = Episodes & {
	categories: {
		[key: string]: string;
	};
};
