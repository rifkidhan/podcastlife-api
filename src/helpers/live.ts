import { FeedObject } from "podcast-partytime";
import { feedParser } from "#/models/parsefeed.ts";
import { sanitizeHTML } from "#/utils/sanitize.ts";

type Unpack<T> = T extends (infer U)[] ? U : T;

export type PodcastLiveItem = Unpack<FeedObject["podcastLiveItems"]> & {
	feedId: string;
	feedTitle: string;
	feedImage?: string;
};

export interface GetLiveParams {
	id: string;
	author?: string;
	url: string;
}

export const getLiveItem = async ({ id, author, url }: GetLiveParams) => {
	const feed = await feedParser(url);

	const liveStream = feed?.podcastLiveItems;

	if (!liveStream) return undefined;

	const results: PodcastLiveItem[] = [];

	for (const live of liveStream) {
		const description = await sanitizeHTML(live.description, []);

		results.push({
			...live,
			description,
			feedTitle: feed.title,
			feedId: id,
			author: live.author ?? feed.author ?? author,
			feedImage: feed.image?.url,
		});
	}

	return results;
};
