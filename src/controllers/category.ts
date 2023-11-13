import { db } from "#/db/db.ts";
import { executeWithOffsetPagination } from "kysely-paginate";
import { groupingCategories } from "#/helpers/matching.ts";

export const getPodcastsFromCategory = async ({
  cat,
  limit = 50,
  page = 1,
}: {
  cat: string;
  limit?: number;
  page?: number;
}) => {
  const category = groupingCategories(cat);

  if (!category) return undefined;

  const data = db
    .selectFrom("Podcast")
    .select([
      "feedId",
      "title",
      "description",
      "author",
      "ownerName",
      "explicit",
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
    )
    .orderBy("newestItemPublishTime", "desc");

  const result = await executeWithOffsetPagination(data, {
    perPage: limit,
    page,
  });

  return result;
};
