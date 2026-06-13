/**
 * One-off Blob smoke test: mirrors the avatar pipeline (sharp -> 400x400 webp ->
 * Vercel Blob "avatars/" folder) and prints the public URL so it can be opened
 * in a browser to confirm the store is public and serving.
 *
 * Run: npx tsx scripts/blob-smoke.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

import sharp from "sharp";
import { put } from "@vercel/blob";

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("MISSING BLOB_READ_WRITE_TOKEN");
    process.exit(1);
  }

  // Generate a recognizable 500x500 test image, then run it through the exact
  // avatar transform (cover crop to 400x400 webp).
  const base = await sharp({
    create: { width: 500, height: 500, channels: 3, background: { r: 13, g: 148, b: 136 } },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="500" height="500"><rect width="500" height="500" fill="#0d9488"/><circle cx="250" cy="200" r="110" fill="#fbbf24"/><text x="250" y="430" font-size="40" fill="#ffffff" text-anchor="middle" font-family="sans-serif">RenewCanvas</text></svg>`
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  const buffer = await sharp(base)
    .rotate()
    .resize(400, 400, { fit: "cover", position: "centre" })
    .webp({ quality: 88 })
    .toBuffer();

  const blob = await put(`avatars/blob-smoke-test.webp`, buffer, {
    access: "public",
    contentType: "image/webp",
    token,
    addRandomSuffix: true,
  });

  console.log("\nBLOB UPLOAD OK");
  console.log("URL:", blob.url);
  console.log("pathname:", blob.pathname);
  console.log("bytes:", buffer.byteLength);
}

main().catch((error) => {
  console.error("BLOB UPLOAD FAILED:", error);
  process.exit(1);
});
