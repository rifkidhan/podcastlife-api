import type { Context, MiddlewareHandler } from "@hono/hono";

export const cache = (options: {
	cacheControl?: string;
	cacheName: string;
}): MiddlewareHandler => {
	const addHeader = (c: Context) => {
		if (options.cacheControl) {
			c.header("Cache-Control", options.cacheControl, { append: true });
		}
		const date = new Date().toUTCString();
		c.header("Last-Modified", date);
		c.header("X-Cache", "MISS");
	};

	// check cache from last modified
	const isCache = (res: Response) => {
		const maxAge = options.cacheControl
			? parseInt(options.cacheControl.match(/max-age=(\d+)/)?.[1] || "0", 10)
			: 0;
		const lastModified = res.headers.get("Last-Modified") || "";
		const modifiedDate = new Date(lastModified).getTime();
		const age = (Date.now() - modifiedDate) / 1000;

		return maxAge > age;
	};

	return async (c, next) => {
		const cache = await caches.open(options.cacheName);
		const key = c.req.url;

		const response = await cache.match(key);

		if (response) {
			// check age
			if (isCache(response)) {
				response.headers.set("X-Cache", "HIT");
				return new Response(response.body, response);
			}
			// put fresh data
			await next();
			if (!c.res.ok) {
				return;
			}
			addHeader(c);
			const copy = c.res.clone();
			await cache.put(key, copy);
		} else {
			// add data to cache
			await next();
			if (!c.res.ok) {
				return;
			}
			addHeader(c);
			const copy = c.res.clone();
			await cache.put(key, copy);
		}
	};
};
