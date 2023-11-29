import "env";
import { Hono, HTTPException } from "hono/mod.ts";
import { bearerAuth, prettyJSON, compress, logger } from "hono/middleware.ts";
import category from "#/routes/categories.ts";
import podcast from "#/routes/podcasts.ts";
import { STATUS_CODE } from "http-status";
import { cronUpdate } from "#/script/updateDb.ts";
import { logs } from "#/middlerwares/log.ts";

const app = new Hono();

cronUpdate();

/**
 * make response json pretty
 * GET /?pretty
 */
app.use("*", prettyJSON());

app.use("*", compress({ encoding: "gzip" }));

/**
 * Token
 */
app.use("/v1/*", bearerAuth({ token: Deno.env.get("APP_KEY") as string }));

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
app.use("*", logger(logs));

app.get("/", (c) => c.text("Podcastlife Api"));

app.route("/v1/podcasts", podcast);
app.route("/v1/categories", category);

console.log("Podcastlife API");
Deno.serve(app.fetch);
