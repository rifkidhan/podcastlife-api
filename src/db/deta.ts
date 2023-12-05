import { Deta } from "https://cdn.deta.space/js/deta@2.0.0/deta.mjs";

const deta = Deta(Deno.env.get("DETA_KEY"));

export const categoryDB = deta.Base("category");

export const podcastDB = deta.Base("podcast");

export type Podcast = {
	key: string;
	podcastGuid: string;
	title: string;
	url: string;
	link?: string;
	originalUrl?: string;
	description?: string;
	author?: string;
	ownerName?: string;
	imageUrl?: string;
	contentType: string;
	itunesId?: string;
	itunesType?: string;
	generator?: string;
	language: string;
	explicit: boolean;
	newestItemPublishTime: string;
	oldestItemPublishTime: string;
	tags: string[];
};

export type Category = Pick<
	Podcast,
	| "imageUrl"
	| "url"
	| "title"
	| "author"
	| "newestItemPublishTime"
	| "ownerName"
	| "language"
	| "explicit"
> & {
	id: number;
	feedTitle: string;
	feedId: string;
};