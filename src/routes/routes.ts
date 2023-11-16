import { Hono, HTTPException } from "hono";
import {
	getPodcastByFeedIdRoute,
	getPodcastsByTagRoute,
	getTrending,
	getEpisodes,
	getPodcastInfo,
	getLive,
} from "#/routes/podcasts.ts";
import { getCategoryByName } from "#/routes/categories.ts";
import { Status, STATUS_TEXT } from "http-status";

const podcast = new Hono();

podcast.get("/podcast/full/:feedId", getPodcastByFeedIdRoute);
podcast.get("/podcast/info/:feedId", getPodcastInfo);
podcast.get("/podcast/episodes", getEpisodes);
podcast.get("/trending", getTrending);
podcast.get("/live", getLive);
podcast.get("/tags", getPodcastsByTagRoute);
podcast.on(["PUT", "DELETE", "POST", "OPTIONS", "PATCH"], "/*", () => {
	throw new HTTPException(Status.MethodNotAllowed, {
		message: STATUS_TEXT[Status.MethodNotAllowed],
	});
});

const category = new Hono();

category.get("/:categoryName", getCategoryByName);
category.on(["PUT", "DELETE", "POST", "OPTIONS", "PATCH"], "/*", () => {
	throw new HTTPException(Status.MethodNotAllowed, {
		message: STATUS_TEXT[Status.MethodNotAllowed],
	});
});

export { category, podcast };
