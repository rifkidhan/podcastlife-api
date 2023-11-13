import "env";
import { Hono, HTTPException } from "hono";
import { prettyJSON, bearerAuth } from "hono/middleware.ts";
import { podcast, category } from "#/routes/routes.ts";
import { Status } from "http-status";

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
	console.error(err);
	if (err instanceof HTTPException) {
		return err.getResponse();
	}
	return c.json({ message: err.message }, Status.InternalServerError);
});

app.get("/");
app.get("/", (c) => c.text("Hello Deno!"));

app.route("/api/podcasts", podcast);
app.route("/api/categories", category);

Deno.serve(app.fetch);
