import "env";
import { DatabaseSchema, getXataClient } from "#/db/xata.ts";
import { TransactionOperation } from "npm:@xata.io/client@latest";
import { initialize, transform } from "#/helpers/image.ts";

const xata = getXataClient();

await initialize();

const update = async () => {
  let podcast = await xata.db.podcasts
    .select(["id", "image"])
    .filter({
      $notExists: "blurhash",
    })
    .getPaginated({
      pagination: {
        size: 200,
      },
      consistency: "eventual",
    });

  const hashes = new Map<string, string | null>();

  for (const feed of podcast.records) {
    const hash = await transform(feed.image);
    console.log("blurhash complete", feed.id);
    hashes.set(feed.id, hash);
  }

  let batch = 1;

  const updater = podcast.records.map((item) => {
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
  }

  while (podcast.hasNextPage) {
    podcast = await podcast.nextPage();

    for (const feed of podcast.records) {
      const hash = await transform(feed.image);
      console.log("blurhash complete", feed.id);
      hashes.set(feed.id, hash);
    }

    batch++;

    const updater = podcast.records.map((item) => {
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
    }
  }

  console.log("done");
};

await update();
