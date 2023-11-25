import type { MiddlewareHandler } from "hono";
import { cachest } from "#/utils/storage.ts";

export const cache = (options: {
	cacheControl?: string;
}): MiddlewareHandler => {
	const addHeader = (response: Response) => {
		if (options.cacheControl)
			response.headers.set("Cache-Control", options.cacheControl);
	};

	return async (c, next) => {
		const key = c.req.url;
		const response = await cachest.match(key);

		if (!response) {
			console.log("cachest not match");
			await next();
			if (!c.res.ok) {
				return;
			}
			addHeader(c.res);
			const response = c.res.clone();
			await cachest.put(c.req.url, response);
		} else {
			return new Response(response.body, response);
		}
	};
};
