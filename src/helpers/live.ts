import { Episode, FeedObject } from "podcast-partytime";
import { PodcastLiveStream } from "#/types.ts";
import { getPodcastUrl } from "#/models/podcast.ts";
import { feedParser } from "#/models/parsefeed.ts";

export enum Phase4LiveStatus {
	Pending = "pending",
	Live = "live",
	Ended = "ended",
}

type PodcastLiveItemBasic = Pick<Episode, "title" | "guid" | "enclosure"> &
	Partial<
		Pick<
			Episode,
			| "description"
			| "link"
			| "author"
			| "podcastPeople"
			| "alternativeEnclosures"
			| "podcastImages"
			| "value"
		>
	>;
type Phase4ContentLink = {
	url: string;
	title: string;
};

export type PodcastLiveItem = PodcastLiveItemBasic & {
	feedId: number;
	feedTitle: string;
	status: Phase4LiveStatus;
	start: Date;
	end?: Date;
	image?: string;
	contentLinks: Phase4ContentLink[];
};

export const getLiveItem = async (id: number) => {
	const liveItems: PodcastLiveItem[] = [];
	const getUrl = await getPodcastUrl(id);

	if (!getUrl) return undefined;

	const feed = await feedParser(getUrl.url);

	const liveStream = feed?.podcastLiveItems;

	if (!liveStream) return undefined;

	for (const item of liveStream) {
		if (item.image === "" || typeof item.image === "undefined") {
			// live.add({ ...item, image: feed.image?.url });
			liveItems.push({
				...item,
				image: feed.image?.url,
				feedTitle: feed.title,
				feedId: id,
			});
		} else {
			// live.add(item);
			liveItems.push({ ...item, feedTitle: feed.title, feedId: id });
		}
	}

	return liveItems;
};