import { db } from "#/db/db.ts";
import { executeWithOffsetPagination } from "kysely-paginate";

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
		.limit(1)
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
	limit = 50,
	page = 1,
}: {
	tag: string;
	page?: number;
	limit?: number;
}) => {
	const data = db
		.selectFrom("Podcast")
		.select([
			"Podcast.feedId",
			"Podcast.title",
			"Podcast.description",
			"Podcast.imageUrl",
			"Podcast.author",
			"Podcast.newestItemPublishTime",
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
		)
		.orderBy("Podcast.newestItemPublishTime", "desc");

	const result = await executeWithOffsetPagination(data, {
		perPage: limit,
		page,
	});

	return result;
};
