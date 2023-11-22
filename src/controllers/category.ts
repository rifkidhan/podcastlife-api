import { db } from "#/db/db.ts";
import { executeWithCursorPagination } from "kysely-paginate";
import { groupingCategories } from "#/helpers/matching.ts";

export const getPodcastsFromCategory = async ({
	cat,
	perPage = 50,
	before,
	after,
}: {
	cat: string;
	perPage?: number;
	before?: string;
	after?: string;
}) => {
	const category = groupingCategories(cat);

	if (!category) return undefined;

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
		.where(({ or, eb }) =>
			or([
				eb("tag1", "in", category),
				eb("tag2", "in", category),
				eb("tag3", "in", category),
				eb("tag4", "in", category),
				eb("tag5", "in", category),
				eb("tag6", "in", category),
				eb("tag7", "in", category),
				eb("tag8", "in", category),
			])
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
