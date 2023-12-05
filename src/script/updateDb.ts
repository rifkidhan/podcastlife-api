import { podcastApi } from "#/models/podcastapi.ts";
import { PodcastInfo } from "#/types.ts";
import { podcastDB, Podcast } from "#/db/deta.ts";

/** get data from one hour ago */
const getRecentData = async () => {
	console.log("fetch data begin...");
	const hour = Math.floor(Date.now() / 1000) - 3600;
	const now = Math.floor(Date.now() / 1000);
	let data = await podcastApi(`/recent/data?since=${hour}&max=5000`).then(
		(res) => res.json()
	);

	let since = data.since;
	let nextSince = data.nextSince;
	let allFeeds = data.data.feeds;

	console.log("recent since: ", since);
	// console.log("next since: ", nextSince);
	// console.log("data length", allFeeds.length);

	while (nextSince < now) {
		data = await podcastApi(
			`/recent/data?since=${data.nextSince}&max=5000`
		).then((res) => res.json());

		since = data.since;
		nextSince = data.nextSince;
		allFeeds = allFeeds.concat(data.data.feeds);

		console.log("recent since: ", since);
		// console.log("next since: ", nextSince);
		// console.log("data length", allFeeds.length);
	}

	return allFeeds;
};

const getFeedFromPodcastIndex = async (id: string) => {
	const data = await podcastApi(`/podcasts/byfeedid?id=${id}`).then((res) =>
		res.json()
	);

	const feed = data.feed as PodcastInfo;

	return feed;
};

const updateDB = async () => {
	const recentData = await getRecentData();

	console.log("fetch data done");

	for (const feed of recentData) {
		if (feed.feedLanguage.includes("en" || "in")) {
			const check = await podcastDB.get(feed.feedId);

			if (!check) {
				const nFeed = await getFeedFromPodcastIndex(feed.feedId);

				if (nFeed.categories) {
					const tags = Object.entries(nFeed.categories)
						.join()
						.split(",")
						.filter((n) => n);

					const putItem: Podcast = {
						key: String(nFeed.id),
						title: nFeed.title,
						podcastGuid: nFeed.podcastGuid,
						url: nFeed.url,
						link: nFeed.link,
						originalUrl: nFeed.originalUrl,
						description: nFeed.description,
						author: nFeed.author,
						ownerName: nFeed.ownerName,
						explicit: nFeed.explicit,
						language: nFeed.language,
						newestItemPublishTime: String(nFeed.lastUpdateTime),
						oldestItemPublishTime: String(nFeed.lastUpdateTime),
						contentType: nFeed.contentType,
						generator: nFeed.generator,
						itunesId:
							typeof nFeed.itunesId === "number"
								? String(nFeed.itunesId)
								: undefined,
						itunesType: nFeed.itunesType,
						tags,
						imageUrl: nFeed.image,
					};

					const podcast = await podcastDB.put(putItem);

					console.log(podcast.key);
				}
			} else {
				console.log(check.key);
				if (feed.feedImage !== "") {
					const update = {
						imageUrl: feed.feedImage,
						newestItemPublishTime: String(Math.floor(Date.now() / 1000)),
					};
					await podcastDB.update(update, check.key);
				} else {
					const update = {
						newestItemPublishTime: String(Math.floor(Date.now() / 1000)),
					};
					await podcastDB.update(
						{
							newestItemPublishTime: String(Math.floor(Date.now() / 1000)),
						},
						check.key
					);
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
	Deno.cron("update db", "0 * * * *", async () => {
		console.log(`update feeds starting`);
		await updateDB();
		console.log("update finished");
	});
};
