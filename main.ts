import "env";
import { Hono, HTTPException } from "hono";
import { bearerAuth, prettyJSON } from "hono/middleware.ts";
import { category, podcast } from "#/routes/routes.ts";
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

app.get("/");
app.get("/", (c) => c.text("Podcastlife Api"));

app.route("/api/podcasts", podcast);
app.route("/api/categories", category);

Deno.serve(app.fetch);
