import "env";
import { Hono, HTTPException } from "hono";
import { bearerAuth, prettyJSON, cache } from "hono/middleware.ts";
import category from "#/routes/categories.ts";
import podcast from "#/routes/podcasts.ts";
import { Status } from "http-status";
import { cronUpdate } from "#/script/updateDb.ts";

const app = new Hono();

cronUpdate();

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

app.get(
	"/",
	(c) => c.text("Podcastlife Api"),
	cache({
		cacheName: "home",
		wait: true,
		cacheControl: "max-age=604800, must-revalidate",
	})
);

app.route("/api/podcasts", podcast);
app.route("/api/categories", category);

Deno.serve(app.fetch);
