import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Auth-gated proxy for private Vercel Blob objects.
 *
 * Files uploaded via `saveFile()` live in a *private* Blob store, so the
 * raw URL Vercel returns isn't directly accessible. We store
 * `/api/blob/<key>` in the DB and serve the bytes through this route,
 * checking that the caller is allowed to see the file before streaming it.
 *
 * Authorization rules (by `key` prefix):
 *   - `kyc/<userId>/...`        → owner or any admin
 *   - `vehicles/<vehicleId>/…`  → vehicle's owner or any admin
 *   - anything else              → admin only
 */
export async function GET(
  _req: Request,
  ctx: { params: { path: string[] } }
) {
  const session = await getSession();
  const user = session?.user as
    | { id: string; isAdmin?: boolean }
    | undefined;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = (ctx.params.path || []).join("/");
  if (!key || key.includes("..")) {
    return NextResponse.json({ error: "Bad path" }, { status: 400 });
  }

  // ── Authorization ─────────────────────────────────────────────────────────
  const [bucket, ownerOrId] = key.split("/");
  let allowed = !!user.isAdmin;

  if (!allowed) {
    if (bucket === "kyc") {
      allowed = ownerOrId === user.id;
    } else if (bucket === "vehicles") {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: ownerOrId },
        select: { ownerId: true },
      });
      allowed = !!vehicle && vehicle.ownerId === user.id;
    }
  }

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Fetch from Vercel Blob ───────────────────────────────────────────────
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage is not configured" },
      { status: 503 }
    );
  }

  try {
    const { get } = await import("@vercel/blob");
    const result = await get(key, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Content-Length": String(result.blob.size),
        // Browser-only cache so admin/user views stay snappy.
        "Cache-Control": "private, max-age=300, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("[/api/blob] fetch failed", err);
    return NextResponse.json(
      { error: "Could not load file", hint: err?.message },
      { status: 500 }
    );
  }
}
