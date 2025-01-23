import "env";
import { Hono } from "@hono/hono";
import { HTTPException } from "@hono/hono/http-exception";
import { bearerAuth } from "@hono/hono/bearer-auth";
import { logger } from "@hono/hono/logger";
import { etag, RETAINED_304_HEADERS } from "@hono/hono/etag";
import { serveStatic } from "@hono/hono/deno";
import { default as categoriesV1 } from "#/routes/v1/categories.ts";
import { default as podcastsV1 } from "#/routes/v1/podcasts.ts";
import { default as episodesV1 } from "#/routes/v1/episodes.ts";
import { STATUS_CODE } from "@std/http/status";
import { updateDB } from "#/script/updateDb.ts";
import { logs } from "#/middlerwares/log.ts";

const isDev = Deno.env.get("DEV");
if (!isDev) {
	Deno.cron("feeds update", "0 */2 * * *", async () => {
		console.log(`update feeds starting`);
		await updateDB();
		console.log("update finished");
	});
}

const app = new Hono();

/**
 * middleware
 */
app.use(
	"/v1/*",
	bearerAuth({ token: Deno.env.get("APP_KEY") as string }),
	etag({
		retainedHeaders: [...RETAINED_304_HEADERS],
	}),
);

/**
 * Logs
 */
app.use("*", logger(logs));

/**
 * is static file needed?
 */
app.use("/favicon.ico", serveStatic({ path: "./favicon.ico" }));

/**
 * Response for not found
 */
app.notFound((c) => {
	return c.text("Your request not found!", STATUS_CODE.NotFound);
});

/**
 * Response for error
 */
app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return err.getResponse();
	}
	console.error(err);
	return c.json({ message: err.message }, STATUS_CODE.InternalServerError);
});

app.get("/", (c) => {
	return c.text("Podcastlife API");
});

app.route("/v1/podcasts", podcastsV1);
app.route("/v1/categories", categoriesV1);
app.route("/v1/episodes", episodesV1);

console.log("Podcastlife API");
Deno.serve(app.fetch);
