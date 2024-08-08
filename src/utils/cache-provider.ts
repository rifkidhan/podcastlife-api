interface ResponseCache {
  data: ArrayBuffer;
  timestamp: number;
  headers: [string, string][];
  status: number;
}

const cachest = () => {
  const provider = new Map<string, ResponseCache>();

  return {
    async add(url: string) {
      await this.set(url, await fetch(url));
    },
    async set(key: string, data: Response) {
      const setData: ResponseCache = {
        data: await data.arrayBuffer(),
        timestamp: Date.now(),
        headers: [...data.headers],
        status: data.status,
      };

      provider.set(key, setData);
    },
    delete(key: string) {
      provider.delete(key);
    },
    async get(key: string): Promise<Response | undefined> {
      const response = provider.get(key);

      if (!response) {
        return undefined;
      }
      const headers = new Headers(response.headers);
      const cacheControl = headers.get("cache-control") || "";

      const maxAge = parseInt(
        cacheControl.match(/max-age=(\d+)/)?.[1] || "0",
        10,
      );
      const swr = parseInt(
        cacheControl.match(/stale-while-revalidate=(\d+)/)?.[1] || "0",
        10,
      );
      const age = (Date.now() - response.timestamp) / 1000;

      const miss = age > maxAge + swr;

      if (miss) {
        console.log("expired cache");
        provider.delete(key);
        return;
      }

      const stale = age > maxAge;

      headers.set("cache", stale ? "STALE" : "HIT");
      headers.set("date", new Date(response.timestamp).toUTCString());

      if (stale) {
        console.log("expired cache");
        await this.add(key);
        return;
      }

      return new Response(response.data, {
        status: response.status ?? 200,
        headers,
      });
    },
    keys() {
      return provider.keys();
    },
  };
};

export default cachest;
