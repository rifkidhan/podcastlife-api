import type { Generated } from "kysely";

export interface Database {
  Podcast: PodcastTable;
}

export interface PodcastTable {
  id: Generated<number>;
  feedId: number;
  podcastGuid: string;
  title: string;
  url: string;
  link: string | null;
  originalUrl: string | null;
  description: string | null;
  author: string | null;
  ownerName: string | null;
  imageUrl: string | null;
  contentType: string;
  itunesId: number | null;
  itunesType: string | null;
  generator: string | null;
  language: string;
  explicit: boolean;
  newestItemPublishTime: number;
  oldestItemPublishTime: number;
  tag1: string;
  tag2: string | null;
  tag3: string | null;
  tag4: string | null;
  tag5: string | null;
  tag6: string | null;
  tag7: string | null;
  tag8: string | null;
}
