import { podcastApi } from "#/lib/api.ts";
import { groupingCategories, integer, language } from "#/helpers/matching.ts";
import { DatabaseSchema, getXataClient, Podcasts } from "#/db/xata.ts";
import { TransactionOperation } from "npm:@xata.io/client@latest";
import { initializeImageMagick, transform } from "#/helpers/image.ts";

interface FeedUpdate {
  id: string;
  url: string;
  title: string;
  newestItemPublishTime: number;
  oldestItemPublishTime: number;
  itunesId?: number;
  image?: string;
  language: string;
  blurhash?: string;
}

const xata = getXataClient();

export const updateDB = async () => {
  await initializeImageMagick();

  const times = Math.floor(Date.now() / 1000) - 7200;
  const newfeed = await podcastApi(`/recent/feeds`, {
    max: "1000",
    since: String(times),
    lang: language(),
  }).then((res) => res.json());

  const data = newfeed.feeds.map((item: FeedUpdate) => {
    return {
      ...item,
      id: String(item.id),
    };
  }) as FeedUpdate[];

  const dataExist = await checkDataExist(data);

  if (dataExist) {
    const { toBeInsert, toBeUpdate } = dataExist;
    console.log("update data length:", toBeUpdate.length);
    console.log("insert new data length:", toBeInsert.length);

    await updateFeeds(toBeUpdate);

    if (toBeInsert.length > 0) {
      await insertFeeds(toBeInsert);
    }
  }
  console.log("done====>>>>>");
};

const checkDataExist = async (feeds: FeedUpdate[]) => {
  try {
    const getPodcasts = feeds.map((item) => {
      return {
        get: {
          table: "podcasts",
          id: item.id,
          columns: ["id"],
        },
      };
    }) satisfies TransactionOperation<DatabaseSchema, keyof DatabaseSchema>[];

    const data = await xata.transactions.run(getPodcasts);

    const result = data.results
      .filter((item: any) => typeof item.columns.id === "string")
      .map((item: any) => {
        return item.columns.id as string;
      });

    const toBeUpdate: FeedUpdate[] = [];
    const toBeInsert: FeedUpdate[] = [];

    for (const feed of feeds) {
      const exist = result.some((id: string) => feed.id === id);
      if (exist) {
        toBeUpdate.push(feed);
      } else {
        toBeInsert.push(feed);
      }
    }

    return {
      toBeInsert,
      toBeUpdate,
    };
  } catch (error) {
    console.error(error);
  }
};

const updateFeeds = async (feeds: FeedUpdate[]) => {
  console.log("update feeds begin");

  const hashes = new Map<string, string | null>();

  for (const feed of feeds) {
    const hash = await transform(feed.image);
    hashes.set(feed.id, hash);
    console.log("update blurhash: ", feed.id);
  }

  const trxUpdate = feeds.map((item) => {
    return {
      update: {
        table: "podcasts",
        id: item.id,
        fields: {
          newestItemPubdate: item.newestItemPublishTime,
          oldestItemPubdate: item.oldestItemPublishTime,
          image: item.image,
          url: item.url,
          blurhash: hashes.get(item.id),
        },
      },
    };
  }) satisfies TransactionOperation<DatabaseSchema, keyof DatabaseSchema>[];

  try {
    await xata.transactions.run(trxUpdate);
    console.log("update success");
  } catch (error) {
    console.error(error);
  }
};

const insertFeeds = async (feeds: FeedUpdate[]) => {
  const podcasts: Podcasts[] = [];

  for await (const feed of feeds) {
    const getData = await podcastApi(`/podcasts/byfeedid`, {
      id: feed.id,
    }).then((res) => res.json());
    const data = getData.feed;

    if (data.categories) {
      const tags = Object.entries(data.categories)
        .join()
        .toLowerCase()
        .split(",")
        .filter((n) => integer(n) === false);

      const hash = await transform(data.image);

      const putItem: Podcasts = {
        id: String(data.id),
        title: data.title,
        url: data.url,
        originalUrl: data.originalUrl,
        link: data.link,
        podcastGuid: data.podcastGuid,
        description: data.description,
        author: data.author,
        owner: data.ownerName,
        image: data.image,
        newestItemPubdate: feed.newestItemPublishTime,
        oldestItemPubdate: feed.oldestItemPublishTime,
        itunesId: data.itunesId,
        itunesType: data.itunesType,
        language: data.language,
        explicit: data.explicit,
        tags,
        blurhash: hash,
      };

      podcasts.push(putItem);
    }
  }

  // add feeds to podcast table
  console.log("add data to podcasts table");

  await xata.db.podcasts.create(podcasts);

  console.log("mapping feeds category");

  const categories = await xata.db.categories.select(["id", "title"]).getAll();

  let batch = 0;

  while (batch < categories.length) {
    const cat = groupingCategories(categories[batch].title);

    const podcast = podcasts.filter((item) =>
      cat.some((tag) => item.tags?.includes(tag)),
    );

    if (podcast.length > 0) {
      await xata.db.category_podcast.create(
        podcast.map((item) => {
          return {
            podcast: item.id,
            category: categories[batch].id,
          };
        }),
      );
    }

    batch++;
  }

  console.log("mapping success");
};
