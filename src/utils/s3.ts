import { S3Client } from "https://deno.land/x/s3_lite_client@0.6.2/mod.ts";

const bucket = Deno.env.get("S3_BUCKET");
const access = Deno.env.get("S3_ACCESS");
const secret = Deno.env.get("S3_SECRET");
const endpoint = Deno.env.get("S3_ENDPOINT") as string;

export const s3 = new S3Client({
	endPoint: endpoint,
	region: "ap1",
	bucket,
	accessKey: access,
	secretKey: secret,
	pathStyle: true,
});
