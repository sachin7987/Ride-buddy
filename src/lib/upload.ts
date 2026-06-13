import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * UploadError is thrown for predictable problems (e.g. missing Blob token in
 * production) so the calling API route can return a clear 4xx/5xx response
 * with a useful message instead of a generic 500.
 */
export class UploadError extends Error {
  constructor(message: string, public readonly hint?: string) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * Saves an uploaded file to whichever blob backend is configured:
 *
 *   1. Vercel Blob       — if `BLOB_READ_WRITE_TOKEN` is set
 *      (auto-injected by Vercel when the Blob integration is added).
 *   2. Local filesystem  — fallback for `next dev`. Files land in
 *      `public/uploads/<subdir>/` so they're served by Next at
 *      `/uploads/<subdir>/<filename>`.
 *
 * On Vercel WITHOUT the Blob integration this throws `UploadError` instead of
 * silently failing — Vercel's filesystem is read-only so a local fallback
 * would just hit ENOENT/EROFS deep in the call stack.
 *
 * Returns the public URL of the saved file.
 */
export async function saveFile(file: File, subdir = ""): Promise<string> {
  const ext = path.extname(file.name) || ".bin";
  const filename = `${crypto.randomBytes(8).toString("hex")}${ext}`;
  const key = subdir ? `${subdir}/${filename}` : filename;

  // Only talk to Vercel Blob when we're actually deployed (Vercel sets VERCEL=1)
  // or running a production build. In local `next dev` we always use the
  // filesystem fallback below — even if a BLOB_READ_WRITE_TOKEN happens to be
  // present in .env — so a stale/rotated token can't break local uploads.
  const onServerless = Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";

  if (onServerless && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      // Lazy-import so that local dev works without the package on the import path.
      const { put } = await import("@vercel/blob");
      // Sensitive uploads (KYC docs, vehicle papers) go into a *private*
      // store. The URL Vercel returns is not directly accessible — clients
      // load these images through our own auth-gated proxy at /api/blob/...
      await put(key, file, {
        access: "private",
        contentType: file.type || undefined,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return `/api/blob/${key}`;
    } catch (err: any) {
      console.error("[saveFile] Vercel Blob put() failed", err);
      throw new UploadError(
        "File storage is misconfigured. Please try again in a moment.",
        err?.message
      );
    }
  }

  // Refuse to fall back to local disk on a serverless host — the filesystem
  // is read-only and any attempt would crash deep inside fs.writeFile.
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    console.error(
      "[saveFile] BLOB_READ_WRITE_TOKEN is missing in production. " +
        "Connect Vercel Blob to your project: Storage → Create Database → Blob → Connect."
    );
    throw new UploadError(
      "File uploads are temporarily unavailable. Our team has been notified.",
      "BLOB_READ_WRITE_TOKEN is not set in this environment."
    );
  }

  // ── Local fallback (dev only) ─────────────────────────────────────────────
  const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
  const dir = path.join(UPLOAD_DIR, subdir);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${key}`;
}
