import { Hono } from "@hono/hono";
import { getXataClient } from "#/db/xata.ts";
import { CATEGORIES } from "#/helpers/constants.ts";
import { language } from "#/helpers/matching.ts";
import { logs } from "#/middlerwares/log.ts";
import { cache } from "@hono/hono/cache";
import { HTTPException } from "@hono/hono/http-exception";

const app = new Hono();
const xata = getXataClient();

app.get(
	"/*",
	cache({
		cacheName: "podcastlife",
		cacheControl: "max-age=7200",
		wait: true,
	}),
);

/**
 * Get feeds by categories
 */
app.get("/:cat", async (c) => {
	const { cat } = c.req.param();

	const { perPage, before, after, lang } = c.req.query();

	let reqPage = 50;

	if (perPage && Number.isInteger(perPage)) {
		reqPage = Number(perPage);
	}

	const group = CATEGORIES.find((v) => v.title === cat);

	if (!group) {
		return c.notFound();
	}
	logs(lang);

	const languages = language(lang).split(",");

	const res = await xata.db.category_podcast
		.select([
			"podcast.id",
			"podcast.title",
			"podcast.author",
			"podcast.owner",
			"podcast.explicit",
			"podcast.newestItemPubdate",
			"podcast.description",
			"podcast.image",
			"podcast.blurhash",
		])
		.filter(
			lang
				? {
					"category.id": group.id,
					"podcast.language": { $any: languages },
				}
				: {
					"category.id": group.id,
				},
		)
		.sort("podcast.newestItemPubdate", "desc")
		.getPaginated({
			consistency: "eventual",
			pagination: {
				size: reqPage,
				before,
				after,
			},
		});

	return c.json({
		data: res.records.map((item) => {
			return {
				...item.podcast,
			};
		}),
	});
});

/**
 * Decline method
 */
app.on(["PUT", "DELETE", "OPTIONS", "PATCH", "POST"], "/*", () => {
	throw new HTTPException(405, { message: "Method Not Allowed" });
});

export default app;
