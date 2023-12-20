import { parseFeed } from "https://esm.sh/podcast-partytime@4.7.0";

const userAgent = Deno.env.get("USER_AGENT");

export const feedParser = async (url: string) => {
	if (!userAgent) {
		console.error("Please make sure to set user agent in .env");
		return null;
	}
	const res = await fetch(url, {
		headers: {
			"user-agent": userAgent,
		},
	}).then((res) => res.text());

	const data = parseFeed(res);

	return data;
};
