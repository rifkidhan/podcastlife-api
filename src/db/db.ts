import { Kysely, ParseJSONResultsPlugin } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";
import { Database } from "#/db/schema.ts";

const dbUrl = Deno.env.get("DATABASE_URL");

const dialect = new PlanetScaleDialect({
	url: dbUrl,
});

export const db = new Kysely<Database>({
	dialect,
	plugins: [new ParseJSONResultsPlugin()],
});
