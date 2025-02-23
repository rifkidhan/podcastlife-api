import { S3Client } from "s3-lite-client";

export const s3Client = new S3Client({
  endPoint: Deno.env.get("S3_ENDPOINT") ?? "",
  region: Deno.env.get("S3_REGION") ?? "",
  secretKey: Deno.env.get("S3_SECRET"),
  accessKey: Deno.env.get("S3_ACCESS"),
  bucket: Deno.env.get("S3_BUCKET"),
});
