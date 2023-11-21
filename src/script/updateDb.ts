import { db } from "#/db/db.ts";
import { podcastApi } from "#/controllers/podcastapi.ts";
// import { errorPodcastApi } from "#/helpers/httpError.ts";
// import { language } from "#/helpers/matching.ts";
import { Cron } from "https://deno.land/x/croner@7.0.5/dist/croner.js";

// const hour = Math.floor(Date.now() / 1000) - 7200;

// interface RecentFeed {
// 	id: number;
// 	url: string;
// 	title: string;
// 	newestItemPublishTime: number;
// }

export interface PodcastInfo {
	key: string;
	id: number;
	podcastGuid: string;
	title: string;
	url: string;
	link: string;
	originalUrl: string;
	description: string;
	author: string;
	ownerName: string;
	image: string;
	artwork: string;
	lastUpdateTime: number;
	contentType: string;
	itunesId: number | null;
	itunesType: string | null;
	language: string;
	explicit: boolean;
	type: number;
	categories: {
		[key: string]: string;
	};
}

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

			if (checkData) {
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
			} else {
				const checkIndex = await podcastApi(
					`/podcasts/byfeedid?id=${feed.feedId}`
				).then((res) => res.json());

				const nFeed = checkIndex.feed as PodcastInfo;
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
		}
	}
};

// export const updateData = async () => {
// 	const res = await podcastApi(
// 		`/recent/feeds?max=1000&pretty&since=${hour}&lang=${language}`
// 	);
// 	if (!res.ok) {
// 		errorPodcastApi(res.status);
// 	}

// 	const data = await res.json().then((d) => d.feeds as RecentFeed[]);

// 	const ids = new Set();

// 	const feeds = data.filter((obj) => {
// 		const isDuplicate = ids.has(obj.id);

// 		ids.add(obj.id);

// 		if (!isDuplicate) {
// 			return true;
// 		}

// 		return false;
// 	});

// 	return feeds;
// };

// export const updateFeed = async () => {
// 	const data = await updateData();

// 	for await (const feed of data) {
// 		await db
// 			.updateTable("Podcast")
// 			.set({
// 				newestItemPublishTime: feed.newestItemPublishTime,
// 			})
// 			.where("feedId", "=", feed.id)
// 			.executeTakeFirst();
// 	}
// };

/**
 * add cron job
 */

export const cronUpdate = () => {
	new Cron("@daily", { name: "update" }, async () => {
		console.log(`update feeds starting`);
		await fromBucket();
		console.log("update finished");
	});
};
