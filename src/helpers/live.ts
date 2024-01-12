import { FeedObject } from "https://esm.sh/podcast-partytime@4.7.0";
import { feedParser } from "#/models/parsefeed.ts";
import { getXataClient } from "#/db/xata.ts";

const xata = getXataClient();

type Unpack<T> = T extends (infer U)[] ? U : T;

export type PodcastLiveItem = Unpack<FeedObject["podcastLiveItems"]> & {
  feedId: string;
  feedTitle: string;
};

export const getLiveItem = async (id: string) => {
  const getUrl = await xata.db.podcasts.read(id);

  if (!getUrl || !getUrl.url) return undefined;

  const author = typeof getUrl.author === "string" ? getUrl.author : undefined;
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
