import { Hono } from "@hono/hono";
import { cache } from "@hono/hono/cache";
import { HTTPException } from "@hono/hono/http-exception";
import { integer, language } from "#/helpers/matching.ts";
import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";
import { logs } from "#/middlerwares/log.ts";
import { CategoryPodcastRecord, getXataClient } from "#/db/xata.ts";
import { Page, SelectedPick } from "npm:@xata.io/client@latest";
import { sanitizeHTML } from "#/utils/sanitize.ts";

type Data = {
	id?: string;
	title?: string;
	explicit: boolean;
	newestItemPubdate: number;
	author?: string | null;
	owner?: string | null;
	description?: string | null;
	image?: string | null;
	blurhash?: string | null;
};

const category = new Hono();

const xata = getXataClient();

category.get(
	"/*",
	cache({
		cacheName: "podcastlife",
		cacheControl: "max-age=7200",
		wait: true,
	}),
);

/**
 * Get All Podcast from Category
 */
category.get("/:categoryName", async (c) => {
	const cat = c.req.param("categoryName");
	const { perPage, before, after, lang } = c.req.query();

	let reqPage = 50;

	if (perPage && integer(perPage)) {
		reqPage = Number(perPage);
	}

	const group = await xata.db.categories
		.filter({
			title: cat,
		})
		.getFirst();

	if (!group) {
		return c.notFound();
	}

	let categories: Page<
		CategoryPodcastRecord,
		SelectedPick<
			CategoryPodcastRecord,
			(
				| "podcast.id"
				| "podcast.title"
				| "podcast.description"
				| "podcast.image"
				| "podcast.explicit"
				| "podcast.author"
				| "podcast.owner"
				| "podcast.newestItemPubdate"
				| "podcast.blurhash"
			)[]
		>
	>;

	if (lang) {
		const languages = language(lang).split(",");
		categories = await xata.db.category_podcast
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
			.filter({
				"category.id": group.id,
				"podcast.language": { $any: languages },
			})
			.sort("podcast.newestItemPubdate", "desc")
			.getPaginated({
				consistency: "eventual",
				pagination: {
					size: reqPage,
					before,
					after,
				},
			});
	} else {
		categories = await xata.db.category_podcast
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
			.filter({
				"category.id": group.id,
			})
			.sort("podcast.newestItemPubdate", "desc")
			.getPaginated({
				consistency: "eventual",
				pagination: {
					size: reqPage,
					before,
					after,
				},
			});
	}

	logs(cat);

	const result: Data[] = [];

	for (const item of categories.records) {
		const description = await sanitizeHTML(item.podcast?.description, []);

		result.push({
			id: item.podcast?.id,
			title: item.podcast?.title,
			author: item.podcast?.author,
			owner: item.podcast?.owner,
			explicit: item.podcast?.explicit ?? false,
			newestItemPubdate: item.podcast?.newestItemPubdate ?? 0,
			description,
			image: item.podcast?.image,
			blurhash: item.podcast?.blurhash,
		});
	}

	return c.json(
		{
			data: result,
			meta: categories.meta,
		},
		STATUS_CODE.OK,
	);
});

/**
 * Decline method
 */
category.on(["PUT", "DELETE", "POST", "OPTIONS", "PATCH"], "/*", () => {
	throw new HTTPException(STATUS_CODE.MethodNotAllowed, {
		message: STATUS_TEXT[STATUS_CODE.MethodNotAllowed],
	});
});

export default category;
