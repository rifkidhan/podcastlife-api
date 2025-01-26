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
import { default as podcasts } from "#/routes/v2/podcasts.ts";
import { default as categories } from "#/routes/v2/categories.ts";
import { updateDB } from "#/script/updateDb.ts";
import { logs } from "#/middlerwares/log.ts";
import { except } from "@hono/hono/combine";

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
	"/*",
	except(
		"/",
		bearerAuth({ token: Deno.env.get("APP_KEY") as string }),
		etag(),
	),
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
	return c.text("Your request not found!", 404);
});

/**
 * Response for error
 */
app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return err.getResponse();
	}
	console.error(err);
	return c.text(err.message, 500);
});

app.get("/", (c) => {
	return c.text("Podcastlife API");
});

/**
 * v1 route
 */
app.route("/v1/podcasts", podcastsV1);
app.route("/v1/categories", categoriesV1);
app.route("/v1/episodes", episodesV1);

/**
 * v2 route
 */
app.route("/v2/", podcasts);
app.route("/v2/categories", categories);

console.log("Podcastlife API");
Deno.serve(app.fetch);
