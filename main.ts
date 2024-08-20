import "env";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { bearerAuth } from "hono/bearer-auth";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { etag, RETAINED_304_HEADERS } from "hono/etag";
import { serveStatic } from "hono/deno";
import category from "#/routes/categories.ts";
import podcast from "#/routes/podcasts.ts";
import episodes from "#/routes/episodes.ts";
import { STATUS_CODE } from "@std/http/status";
import { updateDB } from "#/script/updateDb.ts";
import { logs } from "#/middlerwares/log.ts";

Deno.cron("feeds update", "0 */2 * * *", async () => {
  console.log(`update feeds starting`);
  await updateDB();
  console.log("update finished");
});

const app = new Hono();

/**
 * middleware
 */
app.use(
  "/v1/*",
  bearerAuth({ token: Deno.env.get("APP_KEY") as string }),
  etag({
    retainedHeaders: ["x-message-retain", ...RETAINED_304_HEADERS],
  }),
  prettyJSON(),
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

app.route("/v1/podcasts", podcast);
app.route("/v1/categories", category);
app.route("/v1/episodes", episodes);

console.log("Podcastlife API");
Deno.serve(app.fetch);
