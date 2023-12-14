import { FeedObject } from "https://esm.sh/podcast-partytime@4.7.0";
import { podcastDB } from "#/db/deta.ts";
import { feedParser } from "#/models/parsefeed.ts";

type Unpack<T> = T extends (infer U)[] ? U : T;

export type PodcastLiveItem = Unpack<FeedObject["podcastLiveItems"]> & {
	feedId: number;
	feedTitle: string;
};

export const getLiveItem = async (id: number) => {
	const getUrl = await podcastDB.get(`${id}`);

	if (!getUrl) return undefined;

	const feed = await feedParser(getUrl.url);

	const liveStream = feed?.podcastLiveItems;

	if (!liveStream) return undefined;

	return liveStream.map((item) => {
		if (item.image === "" || typeof item.image === "undefined") {
			return {
				...item,
				image: feed.image?.url,
				feedTitle: feed.title,
				feedId: id,
			};
		}
		return {
			...item,
			feedTitle: feed.title,
			feedId: id,
		};
	});
};
