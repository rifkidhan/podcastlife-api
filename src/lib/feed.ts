import { FeedObject, parseFeed } from "https://esm.sh/podcast-partytime@4.9.1";
import { USER_AGENT } from "#/helpers/constants.ts";

export type { FeedObject };

export const feedParser = async (url: string) => {
	try {
		const res = await fetch(url, {
			headers: {
				"user-agent": USER_AGENT,
			},
		});

		if (!res.ok) {
			throw Error(res.statusText);
		}
		const result = await res.text();
		const data = parseFeed(result);

		return data;
	} catch (error) {
		console.error(error);
		return null;
	}
};
