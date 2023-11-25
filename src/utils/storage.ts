import { s3 } from "#/utils/s3.ts";
import { Headers } from "https://esm.sh/v135/node_fetch.js";

interface CacheMetadata {
	status: number;
	headers: [string, string][];
	timestamp: number;
	[key: string]: unknown;
}

const key = (str: string) => btoa(str);

const store = {
	async put(
		key: string,
		data: ReadableStream<Uint8Array>,
		metadataBody: string
	) {
		await s3.putObject(key, data);
		await s3.putObject("meta-" + key, metadataBody);
	},
	async get(key: string) {
		const checkDataExist = await s3.exists(key);

		if (!checkDataExist) {
			return undefined;
		}

		const loadData = await s3.getObject(key);
		const loadMetadata = await s3.getObject("meta-" + key);

		return {
			data: loadData,
			metadata: await loadMetadata.text(),
		};
	},
	async delete(key: string) {
		await s3.deleteObject(key);
		await s3.deleteObject("meta-" + key);
	},
};

export const cachest = {
	async add(req: RequestInfo): Promise<void> {
		await this.put(new Request(req), await fetch(req));
	},

	async put(req: Request, res: Response) {
		if (!res.ok) {
			throw new TypeError(`Cannot cache response with status ${res.status}`);
		}
		if (req.method !== "GET") {
			throw new TypeError(`Cannot cache response to ${req.method} request`);
		}

		if (res.status === 206) {
			throw new TypeError(
				"Cannot cache response to a range request (206 Partial Content)."
			);
		}

		if (res.headers.get("vary")?.includes("*")) {
			throw new TypeError("Cannot cache response with 'Vary: *' header.");
		}

		const metadata: CacheMetadata = {
			status: res.status,
			headers: [...res.headers],
			timestamp: Date.now(),
		};

		const body = res.body as ReadableStream<Uint8Array>;

		await store.put(key(req.url), body, JSON.stringify(metadata));
	},
	async match(req: RequestInfo) {
		let url: string;
		if (typeof req === "string") {
			url = req;
		} else {
			url = req.url;
			if (req.method !== "GET") {
				return;
			}
		}

		const cKey = key(url);

		const response = await store.get(cKey);

		if (!response) {
			return;
		}

		const metadata = JSON.parse(response.metadata) as CacheMetadata;

		const headers = new Headers(metadata.headers);
		const cacheControl = headers.get("cache-control") || "";
		const maxAge = parseInt(
			cacheControl.match(/max-age=(\d+)/)?.[1] || "0",
			10
		);
		const swr = parseInt(
			cacheControl.match(/stale-while-revalidate=(\d+)/)?.[1] || "0",
			10
		);
		const age = (Date.now() - metadata.timestamp) / 1000;

		const miss = age > maxAge + swr;

		if (miss) {
			console.log("expired cache");
			await store.delete(cKey);
			return;
		}

		const stale = age > maxAge;

		headers.set("cache", stale ? "STALE" : "HIT");
		headers.set("date", new Date(metadata.timestamp).toUTCString());

		if (stale) {
			console.log("stale cache");
			this.add(url);
		}

		return new Response(response.data.body, {
			status: metadata.status ?? 200,
			headers,
		});
	},
};
