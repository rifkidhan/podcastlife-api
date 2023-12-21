import { Episode as EpisodeType } from "https://esm.sh/podcast-partytime@4.7.0";
import { PodcastLiveItem } from "../podcast.ts";

type Episode = EpisodeType & {
  feedId?: string;
  feedTitle?: string;
};

const items = {
  Episode: {
    title: (root: Episode) => root.title,
    feedId: (root: Episode) => root.feedId,
    feedTitle: (root: Episode) => root.feedTitle,
    guid: (root: Episode) => root.guid,
    link: (root: Episode) => root.link,
    author: (root: Episode) => root.author,
    explicit: (root: Episode) => root.explicit,
    enclosure: (root: Episode) => root.enclosure,
    episode: (root: Episode) =>
      root.podcastEpisode?.number ?? root.itunesEpisode,
    episodeType: (root: Episode) => root.itunesEpisodeType,
    duration: (root: Episode) => root.duration,
    description: (root: Episode) => root.description,
    image: (root: Episode) => root.image ?? root.itunesImage,
    pubDate: (root: Episode) => root.pubDate?.toISOString(),
    summary: (root: Episode) => root.summary,
    content: (root: Episode) => root.content,
    subtitle: (root: Episode) => root.subtitle,
    season: (root: Episode) => root.podcastSeason?.number ?? root.itunesSeason,
    altEnclosures: (root: Episode) => root.alternativeEnclosures,
    keywords: (root: Episode) => root.keywords,
    chapters: (root: Episode) => root.podcastChapters?.url,
    transcripts: (root: Episode) => root.podcastTranscripts,
    value: (root: Episode) => root.value,
    persons: (root: Episode) => root.podcastPeople,
    podcastImages: (root: Episode) => root.podcastImages,
  },
  Live: {
    feedId: (root: PodcastLiveItem) => root.feedId,
    feedTitle: (root: PodcastLiveItem) => root.feedTitle,
    guid: (root: PodcastLiveItem) => root.guid,
    title: (root: PodcastLiveItem) => root.title,
    start: (root: PodcastLiveItem) => root.start.toISOString(),
    end: (root: PodcastLiveItem) => root.end?.toISOString(),
    link: (root: PodcastLiveItem) => root.link,
    status: (root: PodcastLiveItem) => root.status,
    image: (root: PodcastLiveItem) => root.image,
    enclosure: (root: PodcastLiveItem) => root.enclosure,
    author: (root: PodcastLiveItem) => root.author,
    description: (root: PodcastLiveItem) => root.description,
    value: (root: PodcastLiveItem) => root.value,
    persons: (root: PodcastLiveItem) => root.podcastPeople,
    podcastImages: (root: PodcastLiveItem) => root.podcastImages,
    altEnclosures: (root: PodcastLiveItem) => root.alternativeEnclosures,
  },
};

export default items;
