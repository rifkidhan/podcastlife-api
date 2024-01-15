export const transaction = async (body: string) => {
  const url = `${Deno.env.get("XATA_DATABASE_URL")}:${Deno.env.get(
    "XATA_BRANCH"
  )}/transaction`;

  const key = Deno.env.get("XATA_API_KEY");

  const trxData = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: body,
  });

  const data = await trxData.json();

  if (!trxData.ok) {
    const errorResult = data.errors;

    console.error(errorResult);
  }

  return data.results;
};
