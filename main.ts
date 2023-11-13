import "env";
import { Hono, HTTPException } from "hono";
import { prettyJSON, bearerAuth } from "hono/middleware.ts";
import { podcast, category } from "#/routes/routes.ts";
import { Status } from "http-status";
import { updateFeed } from "#/script/updateDb.ts";
import { Cron } from "https://deno.land/x/croner@7.0.5/dist/croner.js";

const job = new Cron("* */2 * * * *");

job.schedule(async () => {
	console.log("update feeds starting");
	await updateFeed();
	console.log("update finished");
});

const app = new Hono();

/**
 * make response json pretty
 * GET /?pretty
 */
app.use("*", prettyJSON());

/**
 * Token
 */
app.use("/api/*", bearerAuth({ token: Deno.env.get("APP_KEY") as string }));

/**
 * Response for not found
 */
app.notFound((c) => {
	return c.text("Your request not found!", Status.NotFound);
});

/**
 * Response for error
 */
app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return err.getResponse();
	}
	console.error(err);
	return c.json({ message: err.message }, Status.InternalServerError);
});

app.get("/");
app.get("/", (c) => c.text("Hello Deno!"));

app.route("/api/podcasts", podcast);
app.route("/api/categories", category);

Deno.serve(app.fetch);
