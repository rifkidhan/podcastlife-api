import { db } from "#/db/db.ts";
import { podcastApi } from "#/controllers/podcastapi.ts";
import { errorPodcastApi } from "#/helpers/httpError.ts";
import { language } from "#/helpers/matching.ts";
import { Cron } from "https://deno.land/x/croner@7.0.5/dist/croner.js";

const hour = Math.floor(Date.now() / 1000) - 7200;

interface RecentFeed {
	id: number;
	url: string;
	title: string;
	newestItemPublishTime: number;
}

export const updateData = async () => {
	const res = await podcastApi(
		`/recent/feeds?max=1000&pretty&since=${hour}&lang=${language}`
	);
	if (!res.ok) {
		errorPodcastApi(res.status);
	}

	const data = await res.json().then((d) => d.feeds as RecentFeed[]);

	const ids = new Set();

	const feeds = data.filter((obj) => {
		const isDuplicate = ids.has(obj.id);

		ids.add(obj.id);

		if (!isDuplicate) {
			return true;
		}

		return false;
	});

	return feeds;
};

export const updateFeed = async () => {
	const data = await updateData();

	for await (const feed of data) {
		await db
			.updateTable("Podcast")
			.set({
				newestItemPublishTime: feed.newestItemPublishTime,
			})
			.where("feedId", "=", feed.id)
			.executeTakeFirst();
	}
};

/**
 * add cron job
 */

export const cronUpdate = () => {
	const update = new Cron("1 * */2 * * *", async () => {
		console.log("update feeds starting");
		await updateFeed();
		console.log("update finished");
	});

	if (update.nextRun() === null) {
		console.log("something error in cronjob");
	} else {
		console.log("Job will fire at " + update.nextRun());
	}
};
