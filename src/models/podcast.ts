import { db } from "#/db/db.ts";
import { executeWithCursorPagination } from "kysely-paginate";

/**
 * get podcast info from database
 * @param id number
 * @returns
 */
export const getPodcastByFeedId = async (id: number) => {
	const data = await db
		.selectFrom("Podcast")
		.selectAll()
		.where("Podcast.feedId", "=", id)
		.executeTakeFirst();

	return data;
};

export const getPodcastUrl = async (id: number) => {
	const data = await db
		.selectFrom("Podcast")
		.select(["feedId", "url", "originalUrl", "link", "title"])
		.where("Podcast.feedId", "=", id)
		.executeTakeFirst();

	return data;
};

/**
 * Get podcast by podcast tag. In podcastindex, the tags are categories.
 *
 * @param {{tag, limit, page}: {tag: string, limit?: number, page?: number}}
 * @returns
 */
export const getPodcastsByTag = async ({
	tag,
	perPage = 50,
	before,
	after,
}: {
	tag: string;
	perPage?: number;
	before?: string;
	after?: string;
}) => {
	const data = db
		.selectFrom("Podcast")
		.select([
			"feedId",
			"title",
			"author",
			"ownerName",
			"explicit",
			"imageUrl",
			"newestItemPublishTime",
		])
		.where((eb) =>
			eb.or({
				tag1: tag,
				tag2: eb.ref("tag1"),
				tag3: eb.ref("tag1"),
				tag4: eb.ref("tag1"),
				tag5: eb.ref("tag1"),
				tag6: eb.ref("tag1"),
				tag7: eb.ref("tag1"),
				tag8: eb.ref("tag1"),
			})
		);

	const result = await executeWithCursorPagination(data, {
		perPage,
		before,
		after,
		fields: [
			{ expression: "newestItemPublishTime", direction: "desc" },
			{
				expression: "feedId",
				direction: "asc",
			},
		],
		parseCursor: (cursor) => ({
			newestItemPublishTime: cursor.newestItemPublishTime,
			feedId: parseInt(cursor.feedId, 10),
		}),
	});

	return result;
};
