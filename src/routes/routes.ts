import { HTTPException, Hono } from "hono";
import {
	getPodcastByFeedIdRoute,
	getTrending,
	getPodcastsByTagRoute,
} from "#/routes/podcasts.ts";
import { getCategoryByName } from "#/routes/categories.ts";
import { Status, STATUS_TEXT } from "http-status";

const podcast = new Hono();

podcast.get("/podcast/:feedId", getPodcastByFeedIdRoute);
podcast.get("/trending", getTrending);
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

export { podcast, category };
