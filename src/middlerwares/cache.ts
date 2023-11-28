import type { MiddlewareHandler } from "hono";
import cachest from "#/utils/cache-provider.ts";

export const cache = (options: {
	cacheControl?: string;
}): MiddlewareHandler => {
	const addHeader = (response: Response) => {
		if (options.cacheControl)
			response.headers.set("Cache-Control", options.cacheControl);
	};

	const provider = cachest();

	return async (c, next) => {
		const key = c.req.url;

		const response = await provider.get(key);

		if (!response) {
			await next();
			if (!c.res.ok) {
				return;
			}
			addHeader(c.res);
			const response = c.res.clone();
			provider.set(c.req.url, response);
		} else {
			return new Response(response.body, response);
		}
	};
};
