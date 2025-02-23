import { Hono } from "@hono/hono";
import { s3Client } from "#/lib/s3.ts";

const app = new Hono();

app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const image = await s3Client.getObject(id);

  if (!image.ok) {
    return c.notFound();
  }

  return c.body(await image.bytes(), 200, {
    "Content-Type": "image/png",
  });
});

export default app;
