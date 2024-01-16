/**
 * Remove manually in local.
 */

import "env";
import { getXataClient } from "#/db/xata.ts";
import csv from "npm:convert-csv-to-json";

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
  const jsonDead = csv.fieldDelimiter(",").csvStringToJson(data);
  console.log("convert done.");

  const limit = 1000;
  let batch = 1;
  let deleteRecords = jsonDead.slice((batch - 1) * limit, limit * batch);

  while (deleteRecords.length > 0) {
    console.log("remove dead podcast batch:", batch);
    await xata.db.podcasts.delete(deleteRecords.map((item: any) => item["3"]));
    batch++;
    deleteRecords = jsonDead.slice((batch - 1) * limit, limit * batch);
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
    orphanMap.records.map((item) => item.id)
  );

  while (orphanMap.hasNextPage()) {
    orphanMap = await orphanMap.nextPage();
    console.log("start with", orphanMap.records[0].id);

    await xata.db.category_podcast.delete(
      orphanMap.records.map((item) => item.id)
    );
  }

  console.log("done-------->>>>");
};

await removeDeadPodcast();
