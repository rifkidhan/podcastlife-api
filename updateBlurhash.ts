import "env";
import {
  DatabaseSchema,
  getXataClient,
  type PodcastsRecord,
} from "#/db/xata.ts";
import {
  TransactionOperation,
  type Page,
  type SelectedPick,
} from "npm:@xata.io/client@latest";
import { initialize, transform } from "#/helpers/image.ts";

const xata = getXataClient();

await initialize();

const update = async () => {
  let podcast = await xata.db.podcasts
    .select(["id", "image", "blurhash", "blurhashError"])
    .filter({
      $all: [{ $notExists: "blurhash" }, { blurhashError: false }],
    })
    .getPaginated({
      pagination: {
        size: 250,
      },
      consistency: "eventual",
    });

  let batch = 1;
  let blurhashErrorProcess = false;
  const hashes = new Map<string, string | null>();

  for (const feed of podcast.records) {
    const hash = await transform(feed.image);
    console.log("blurhash complete", feed.id);
    hashes.set(feed.id, hash);
  }

  let updater = podcast.records.map((item) => {
    return {
      update: {
        table: "podcasts",
        id: item.id,
        fields: {
          blurhash: hashes.get(item.id),
        },
      },
    };
  }) satisfies TransactionOperation<DatabaseSchema, keyof DatabaseSchema>[];

  try {
    console.log("update batch: ", batch);
    await xata.transactions.run(updater);
    hashes.clear();
  } catch (e) {
    console.log(e.status);
    blurhashErrorProcess = true;
  }

  if (blurhashErrorProcess) {
    const blurhashError = podcast.records.map((item) => {
      return {
        update: {
          table: "podcasts",
          id: item.id,
          fields: {
            blurhashError: true,
          },
        },
      };
    }) satisfies TransactionOperation<DatabaseSchema, keyof DatabaseSchema>[];

    try {
      console.log("writing error");
      await xata.transactions.run(blurhashError);
      blurhashErrorProcess = false;
    } catch (e) {
      console.log(e.status);
      blurhashErrorProcess = false;
    }
  }

  while (podcast.hasNextPage) {
    podcast = await podcast.nextPage();

    batch++;
    for (const feed of podcast.records) {
      const hash = await transform(feed.image);
      console.log("blurhash complete", feed.id);
      hashes.set(feed.id, hash);
    }

    updater = podcast.records.map((item) => {
      return {
        update: {
          table: "podcasts",
          id: item.id,
          fields: {
            blurhash: hashes.get(item.id),
          },
        },
      };
    }) satisfies TransactionOperation<DatabaseSchema, keyof DatabaseSchema>[];

    try {
      console.log("update batch: ", batch);
      await xata.transactions.run(updater);
      hashes.clear();
    } catch (e) {
      console.log(e.status);
      blurhashErrorProcess = true;
    }

    if (blurhashErrorProcess) {
      const blurhashError = podcast.records.map((item) => {
        return {
          update: {
            table: "podcasts",
            id: item.id,
            fields: {
              blurhashError: true,
            },
          },
        };
      }) satisfies TransactionOperation<DatabaseSchema, keyof DatabaseSchema>[];

      try {
        console.log("writing error");
        await xata.transactions.run(blurhashError);
        blurhashErrorProcess = false;
      } catch (e) {
        console.log(e.status);
        blurhashErrorProcess = false;
      }
    }
  }

  console.log("done");
};

await update();
