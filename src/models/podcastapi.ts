import { crypto } from "@std/crypto/crypto";
import { encodeHex } from "@std/encoding/hex";

const podcastUrl = Deno.env.get("PODCAST_URL") || "https://rifkidhan.my.id";
const podcastKey = Deno.env.get("PODCAST_KEY") || "https://rifkidhan.my.id";
const podcastSecret = Deno.env.get("PODCAST_SECRET") ||
  "https://rifkidhan.my.id";
const userAgent = Deno.env.get("USER_AGENT") || "PodcastLife/1.0";

export const podcastApi = async (
  endpoint: string,
  query?: Record<string, string>,
) => {
  const times = Math.floor(Date.now() / 1000);

  const dataHash = podcastKey + podcastSecret + times;

  const hash = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(dataHash),
  );

  const authHeader = encodeHex(hash);

  const url = new URL(podcastUrl + endpoint);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const data = await fetch(url, {
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
