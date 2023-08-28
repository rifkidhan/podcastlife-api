import { Kysely, ParseJSONResultsPlugin } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";
import { Database } from "#/db/schema.ts";

const host = Deno.env.get("DATABASE_HOST");
const username = Deno.env.get("DATABASE_USERNAME");
const password = Deno.env.get("DATABASE_PASSWORD");

const dialect = new PlanetScaleDialect({
	host,
	username,
	password,
});

export const db = new Kysely<Database>({
	dialect,
	plugins: [new ParseJSONResultsPlugin()],
});
