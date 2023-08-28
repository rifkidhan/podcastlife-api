import { Generated } from "kysely";

export interface Database {
	category: CategoryTable;
	podcast: PodcastTable;
}

export interface CategoryTable {
	id: Generated<number>;
	title: string;
	podcast: Array<PodcastTable>;
}

export interface PodcastTable {
	id: Generated<number>;
	feedId: number;
	podcastGuid: string;
	title: string;
	url: string | null;
	link: string | null;
	originalUrl: string | null;
	description: string | null;
	author: string | null;
	ownerName: string | null;
	image: string;
	artwork: string;
	contentType: string;
	itunesId: number | null;
	itunesType: string | null;
	generator: string | null;
	language: string | null;
	explicit: boolean | null;
	type: number;
	dead: boolean;
	locked: boolean;
	imageUrlHash: number | null;
	categorories: Array<CategoryTable>;
	value: Value | null;
	funding: Funding | null;
}

interface Destinations {
	name: string;
	address: string;
	type: string;
	split: number;
	fee: boolean | null;
	customKey: string | null;
	customValue: string | null;
}

interface Value {
	model: {
		type: "lightning" | "hive" | "webmonetization";
		method: string;
		suggested: string;
	};
	destinations: Array<Destinations>;
}

interface Funding {
	message: string;
	url: string;
}
