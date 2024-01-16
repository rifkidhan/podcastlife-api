import { FeedObject } from "https://esm.sh/podcast-partytime@4.7.0";
import { feedParser } from "#/models/parsefeed.ts";

type Unpack<T> = T extends (infer U)[] ? U : T;

export type PodcastLiveItem = Unpack<FeedObject["podcastLiveItems"]> & {
  feedId: string;
  feedTitle: string;
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

  return liveStream.map((item) => {
    if (item.image === "" || typeof item.image === "undefined") {
      return {
        ...item,
        image: feed.image?.url,
        feedTitle: feed.title,
        feedId: id,
        author: item.author ?? feed.author ?? author,
      };
    }

    return {
      ...item,
      feedTitle: feed.title,
      feedId: id,
      author: item.author ?? feed.author ?? author,
    };
  });
};
