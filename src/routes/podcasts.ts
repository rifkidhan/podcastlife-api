import { httpErrors, Status, RouterContext } from "oak";
import { podcastApi } from "#/lib/podcastapi.ts";
import { feedParser } from "#/lib/parsefeed.ts";

const now = Math.floor(Date.now() / 1000) - 604800;

export const getPodcast = async <R extends string>(ctx: RouterContext<R>) => {
	const { id, req } = ctx.params;
	const res = ctx.response;

	const test = "https://feeds.simplecast.com/54nAGcIl";
	const testLive = "https://feeds.podcastindex.org/100retro.xml";

	try {
		// const trending = await podcastApi(`/podcasts/byfeedid?id=${id}`);
		// if (trending) {
		// 	const data = await trending.json();
		// 	res.body = data;
		// }
		const feed = await feedParser(test);
		if (feed) {
			res.body = feed;
		}
	} catch (error) {
		throw error;
	}
};

export const getTrending = async <R extends string>(ctx: RouterContext<R>) => {
	const params = ctx.request.url.searchParams;
	const res = ctx.response;

	let maxResponse = 10;
	const max = params.get("max");

	if (max) {
		maxResponse = Number(max);
	}

	try {
		const trending = await podcastApi(
			`/podcasts/trending?max=${maxResponse}&since=${now}&pretty`
		);
		if (trending) {
			const data = await trending.json();
			res.body = data;
			res.status = Status.OK;
			console.log("ok");
		}
	} catch (error) {
		throw error;
	}
};
