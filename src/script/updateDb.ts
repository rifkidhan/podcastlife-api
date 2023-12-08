import { podcastApi } from "#/models/podcastapi.ts";
import { PodcastInfo } from "#/types.ts";
import { Podcast, podcastDB } from "#/db/deta.ts";
import { integer } from "#/helpers/matching.ts";

const detaUrl = `${Deno.env.get("DETA_URL")}/podcast`;

const detaKey = Deno.env.get("DETA_KEY") as string;

const updateHttp = async ({
	key,
	objects,
}: {
	key: string;
	objects: {
		imageUrl?: string;
		newestItemPublishTime: string;
	};
}) => {
	let putData = {
		newestItemPublishTime: objects.newestItemPublishTime,
	};

	if (objects.imageUrl && objects.imageUrl !== "") {
		putData = Object.assign(putData, { imageUrl: objects.imageUrl });
	}
	const data = await fetch(detaUrl + "/items/" + key, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			"X-API-Key": detaKey,
		},
		body: JSON.stringify({ set: putData }),
	});

	return data;
};

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
	console.log("data length", allFeeds.length);

	while (nextSince < now) {
		data = await podcastApi(
			`/recent/data?since=${data.nextSince}&max=5000`
		).then((res) => res.json());

		since = data.since;
		nextSince = data.nextSince;
		allFeeds = allFeeds.concat(data.data.feeds);

		console.log("recent since: ", since);
		console.log("data length", allFeeds.length);
	}

	const idx = new Set();

	const allData = allFeeds.filter((obj: any) => {
		const isDuplicate = idx.has(obj.feedId);

		idx.add(obj.feedId);

		if (!isDuplicate) {
			return true;
		}

		return false;
	});

	console.log("final data length", allData.length);

	return allData;
};

const getFeedFromPodcastIndex = async (id: string) => {
	const data = await podcastApi(`/podcasts/byfeedid?id=${id}`).then((res) =>
		res.json()
	);

	const feed = data.feed as PodcastInfo;

	return feed;
};

export const updateDB = async () => {
	const recentData = await getRecentData();

	console.log("fetch data done");

	const newFeeds: Podcast[] = [];

	for (const feed of recentData) {
		if (feed.feedLanguage.includes("en" || "in")) {
			const update = await updateHttp({
				key: feed.feedId,
				objects: {
					imageUrl: feed.feedImage,
					newestItemPublishTime: String(Math.floor(Date.now() / 1000)),
				},
			});

			if (!update.ok) {
				const nFeed = await getFeedFromPodcastIndex(feed.feedId);

				if (nFeed.categories) {
					const tags = Object.entries(nFeed.categories)
						.join()
						.split(",")
						.filter((n) => integer(n) === false);

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
					newFeeds.push(putItem);

					// const podcast = await podcastDB.put(putItem);

					// console.log("podcast added", podcast.key);
				}
			}
		}
	}

	console.log("new feeds", newFeeds.length);

	if (newFeeds.length > 25) {
		const limit = 25;
		let page = 1;
		let slicer = newFeeds.slice((page - 1) * limit, limit * page);

		console.log("podcast add from", slicer[0].key);
		while (slicer.length < 1) {
			page++;
			slicer = newFeeds.slice((page - 1) * limit, limit * page);
			console.log("podcast add from", slicer[0].key);
		}
	} else {
		await podcastDB.putMany(newFeeds);
	}

	console.log("done====>>>>>");
};

export const deleteDeadPodcast = async () => {
	console.log("fetch dead podcast");
	const data = await podcastApi("/podcasts/dead").then((res) => res.json());

	for (const feed of data.feeds) {
		await podcastDB.delete(feed.id);
	}
};

/**
 * add cron job
 */
export const cronUpdate = () => {
	Deno.cron("update db", "0 */2 * * *", async () => {
		console.log(`update feeds starting`);
		await updateDB();
		console.log("update finished");
	});
	Deno.cron("remove podcast dead", "0 0 1 * *", async () => {
		console.log(`delete feeds starting`);
		await deleteDeadPodcast();
		console.log("remove finished");
	});
};
