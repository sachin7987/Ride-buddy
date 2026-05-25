import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Saves an uploaded file to whichever blob backend is configured:
 *
 *   1. Vercel Blob       — if `BLOB_READ_WRITE_TOKEN` is set
 *      (auto-injected by Vercel when the Blob integration is added).
 *   2. Local filesystem  — fallback for `next dev`. Files land in
 *      `public/uploads/<subdir>/` so they're served by Next at
 *      `/uploads/<subdir>/<filename>`.
 *
 * Returns the public URL of the saved file.
 */
export async function saveFile(file: File, subdir = ""): Promise<string> {
  const ext = path.extname(file.name) || ".bin";
  const filename = `${crypto.randomBytes(8).toString("hex")}${ext}`;
  const key = subdir ? `${subdir}/${filename}` : filename;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Lazy-import so that local dev works without the package on the import path.
    const { put } = await import("@vercel/blob");
    const { url } = await put(key, file, {
      access: "public",
      contentType: file.type || undefined,
      addRandomSuffix: false,
    });
    return url;
  }

  // ── Local fallback (dev only) ─────────────────────────────────────────────
  const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
  const dir = path.join(UPLOAD_DIR, subdir);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${key}`;
}
