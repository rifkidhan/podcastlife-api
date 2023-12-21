import "env";
import { Hono, HTTPException } from "hono";
import { bearerAuth, logger, prettyJSON } from "hono/middleware";
import category from "#/routes/categories.ts";
import podcast from "#/routes/podcasts.ts";
import { STATUS_CODE } from "http-status";
import { updateDB } from "#/script/updateDb.ts";
import { logs } from "#/middlerwares/log.ts";
import { createYoga } from "graphql-yoga";
import schema from "#/graphql/schema.ts";
import { useResponseCache } from "npm:@graphql-yoga/plugin-response-cache";
import { Cron } from "https://deno.land/x/croner@8.0.0/dist/croner.js";
import { initialize } from "https://deno.land/x/imagemagick_deno/mod.ts";

const job = new Cron(
  "0 */2 * * *",
  { name: "update feeds", timezone: "Asia/Jakarta" },
  async () => {
    console.log(`update feeds starting`);
    await updateDB();
    console.log("update finished");
  }
);
console.log(job.name, job.nextRun()?.toString());

await initialize();

const app = new Hono();

/**
 * make response json pretty
 * GET /?pretty
 */
app.use("/v1/*", prettyJSON());

/**
 * Token
 */
app.use("/*", bearerAuth({ token: Deno.env.get("APP_KEY") as string }));

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

const yoga = createYoga({
  schema,
  graphiql: Deno.env.get("ENV") === "development",
  batching: {
    limit: 2,
  },
  plugins: [
    useResponseCache({
      session: (request) => request.headers.get("authorization"),

      ttl: 5_000,
      ttlPerSchemaCoordinate: {
        "Query.episode": 30_000,
        "Query.podcast": 20_000,
        "Query.podcasts": 10_000,
        "Query.podcastByCategory": 20_000,
        "Query.live": 30_000,
      },
    }),
  ],
});

app.on(["POST", "GET", "OPTIONS"], "/graphql", async (c) => {
  const response = await yoga.handleRequest(c.req.raw, c);

  return new Response(response.body, response);
});

app.get("/", (c) => {
  return c.text("Podcastlife API");
});

app.route("/v1/podcasts", podcast);
app.route("/v1/categories", category);

console.log("Podcastlife API");
Deno.serve(app.fetch);
