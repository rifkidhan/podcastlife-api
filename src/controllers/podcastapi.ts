import {
	crypto,
	toHashString,
} from "https://deno.land/std@0.200.0/crypto/mod.ts";

const podcastUrl = Deno.env.get("PODCAST_URL") || "https://rifkidhan.my.id";
const podcastKey = Deno.env.get("PODCAST_KEY") || "https://rifkidhan.my.id";
const podcastSecret =
	Deno.env.get("PODCAST_SECRET") || "https://rifkidhan.my.id";
const userAgent = Deno.env.get("USER_AGENT") || "PodcastLife/1.0";

export const podcastApi = async (req: string) => {
	const times = Math.floor(Date.now() / 1000);

	const dataHash = podcastKey + podcastSecret + times;

	const hash = await crypto.subtle.digest(
		"SHA-1",
		new TextEncoder().encode(dataHash)
	);

	const authHeader = toHashString(hash);

	const data = await fetch(`${podcastUrl}${req}`, {
		method: "GET",
		headers: {
			"X-Auth-Date": times.toString(),
			"X-Auth-Key": podcastKey,
			Authorization: authHeader,
			"User-Agent": userAgent,
		},
	});

	return data;
};
