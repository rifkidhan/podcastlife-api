interface ResponseCache {
  data: ArrayBuffer;
  timestamp: number;
  headers: [string, string][];
  status: number;
}

export class Cachest {
  private provider = new Map<string, ResponseCache>();

  add = async (url: string) => {
    await this.set(url, await fetch(url));
  };
  set = async (key: string, data: Response) => {
    const setData: ResponseCache = {
      data: await data.arrayBuffer(),
      timestamp: Date.now(),
      headers: [...data.headers],
      status: data.status,
    };

    this.provider.set(key, setData);
  };
  delete = (key: string) => {
    this.provider.delete(key);
  };

  get = async (key: string): Promise<Response | undefined> => {
    const response = this.provider.get(key);

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
      this.provider.delete(key);
      return;
    }

    const stale = age > maxAge;

    headers.set("x-cache", stale ? "STALE" : "HIT");
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
  };

  keys = () => {
    return this.provider.keys();
  };
}
