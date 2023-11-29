import { db } from "#/db/db.ts";
import { podcastApi } from "#/models/podcastapi.ts";
import { PodcastInfo } from "#/types.ts";
// import { Cron } from "https://deno.land/x/croner@7.0.5/dist/croner.js";

export const fromBucket = async () => {
	const result = await fetch("https://tracking.podcastindex.org/current", {
		method: "GET",
	});

	const data = await result.json().then((res) => res.data.feeds);

	for (const feed of data) {
		if (feed.feedLanguage.includes("en" || "in")) {
			const checkData = await db
				.selectFrom("Podcast")
				.select(["feedId"])
				.where("feedId", "=", feed.feedId)
				.executeTakeFirst();

			console.log(checkData);

			if (!checkData) {
				const checkIndex = await podcastApi(
					`/podcasts/byfeedid?id=${feed.feedId}`
				).then((res) => res.json());

				const nFeed = checkIndex.feed as PodcastInfo;
				if (nFeed.categories) {
					const categories = Object.entries(nFeed.categories).join().split(",");
					const createFeeds = await db
						.insertInto("Podcast")
						.values({
							title: nFeed.title,
							feedId: nFeed.id,
							podcastGuid: nFeed.podcastGuid,
							url: nFeed.url,
							link: nFeed.link,
							originalUrl: nFeed.originalUrl,
							description: nFeed.description,
							author: nFeed.author,
							ownerName: nFeed.ownerName,
							imageUrl: nFeed.image,
							contentType: nFeed.contentType,
							itunesId: nFeed.itunesId,
							itunesType: nFeed.itunesType,
							language: nFeed.language,
							explicit: nFeed.explicit,
							newestItemPublishTime: nFeed.lastUpdateTime,
							oldestItemPublishTime: nFeed.lastUpdateTime,
							tag1: categories[0],
							tag2: categories[1],
							tag3: categories[2],
							tag4: categories[3],
							tag5: categories[4],
							tag6: categories[5],
							tag7: categories[6],
							tag8: categories[7],
						})
						.executeTakeFirst();
					if (createFeeds.numInsertedOrUpdatedRows) {
						console.log("create data success", nFeed.id);
					}
				}
			} else {
				if (feed.feedImage !== "") {
					await db
						.updateTable("Podcast")
						.set({
							newestItemPublishTime: Math.floor(Date.now() / 1000),
							imageUrl: feed.feedImage,
						})
						.where("feedId", "=", feed.feedId)
						.executeTakeFirst();
				} else {
					await db
						.updateTable("Podcast")
						.set({
							newestItemPublishTime: Math.floor(Date.now() / 1000),
						})
						.where("feedId", "=", feed.feedId)
						.executeTakeFirst();
				}
				console.log("update data succes: ", feed.feedId);
			}
		}
	}
};

/**
 * add cron job
 */
export const cronUpdate = () => {
	// const jobs = new Cron(
	// 	"0 0 1 * * *",
	// 	{ name: "update podcast", timezone: "Asia/Jakarta" },
	// 	async () => {
	// 		console.log(`update feeds starting`);
	// 		await fromBucket();
	// 		console.log("update finished");
	// 	}
	// );
	Deno.cron("update db", "0 1 * * *", async () => {
		console.log(`update feeds starting`);
		await fromBucket();
		console.log("update finished");
	});
};
