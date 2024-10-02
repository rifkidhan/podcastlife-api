/**
 * Remove manually in local.
 */

import "env";
import { getXataClient } from "#/db/xata.ts";
import { parse } from "jsr:@std/csv";

const xata = getXataClient();

const removeDeadPodcast = async () => {
  console.log("fetch dead podcast");
  const url = "https://public.podcastindex.org/podcastindex_dead_feeds.csv";
  const csvData = await fetch(url, {
    headers: {
      "Content-Type": "text/csv",
    },
  });
  const data = await csvData.text();

  console.log("fetch done, convert to json.");
  const jsonDead = parse(data, { columns: ["id", "duplicate"] });
  console.log("convert done.");

  const limit = 1000;
  const totalSlice = Math.ceil(jsonDead.length / limit);

  const range = {
    start: (part: number) => {
      return (part - 1) * limit;
    },
    end: (part: number) => {
      const start = (part - 1) * limit;
      return Math.min(start + totalSlice);
    },
  };

  let batch = 2727;

  let deleteRecords = jsonDead.slice(range.start(batch), range.end(batch));

  try {
    console.log("remove dead podcast batch:", batch);
    await xata.db.podcasts.delete(deleteRecords.map((item) => item.id));
    console.log("remove dead podcast batch:", batch, " successfully.");
  } catch (e) {
    console.log(e);
  }

  while (batch < totalSlice) {
    batch++;
    deleteRecords = jsonDead.slice(range.start(batch), range.end(batch));

    try {
      console.log("remove dead podcast batch:", batch);
      await xata.db.podcasts.delete(deleteRecords.map((item) => item.id));
      console.log("remove dead podcast batch:", batch, " successfully.");
    } catch (e) {
      console.log(e);
    }
  }

  console.log("remove orphan categorymap");

  let orphanMap = await xata.db.category_podcast
    .select(["id"])
    .filter({
      $notExists: "podcast.id",
    })
    .getPaginated({
      pagination: {
        size: 1000,
      },
    });

  console.log("start with", orphanMap.records[0].id);
  await xata.db.category_podcast.delete(
    orphanMap.records.map((item) => item.id),
  );

  while (orphanMap.hasNextPage()) {
    orphanMap = await orphanMap.nextPage();
    console.log("start with", orphanMap.records[0].id);

    await xata.db.category_podcast.delete(
      orphanMap.records.map((item) => item.id),
    );
  }

  console.log("done-------->>>>");
};

await removeDeadPodcast();
