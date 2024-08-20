import { parseFeed } from "https://esm.sh/podcast-partytime@4.8.0";

const userAgent = Deno.env.get("USER_AGENT");

export const feedParser = async (url: string) => {
  if (!userAgent) {
    console.error("Please make sure to set user agent in .env");
    return null;
  }

  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": userAgent,
      },
    });

    if (res.ok) {
      const result = await res.text();
      const data = parseFeed(result);

      return data;
    }

    return null;
  } catch (error) {
    console.error(error);
  }
};
