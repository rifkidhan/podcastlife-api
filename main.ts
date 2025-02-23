import "env";
import { Hono } from "@hono/hono";
import { HTTPException } from "@hono/hono/http-exception";
import { bearerAuth } from "@hono/hono/bearer-auth";
import { logger } from "@hono/hono/logger";
import { etag } from "@hono/hono/etag";
import { serveStatic } from "@hono/hono/deno";
import { default as podcasts } from "#/routes/v2/podcasts.ts";
import { default as categories } from "#/routes/v2/categories.ts";
import { default as image } from "#/routes/image.ts";
import { updateDB } from "#/script/updateDb.ts";
import { logs } from "#/middlerwares/log.ts";
import { except } from "@hono/hono/combine";

// if (!Deno.env.get("DEV")) {
//   Deno.cron("feeds update", "0 */2 * * *", async () => {
//     console.log(`update feeds starting`);
//     await updateDB();
//     console.log("update finished");
//   });
// }

const app = new Hono();

/**
 * middleware
 */
app.use(
  "/*",
  except(
    ["/", "/image/*", "/favicon.ico"],
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
 * v2 route
 */
app.route("/v2/", podcasts);
app.route("/v2/categories", categories);
app.route("/image", image);

console.log("Podcastlife API");
Deno.serve(app.fetch);
