import { NextResponse } from "next/server";
import { consumeEmailVerification } from "@/lib/email-verification";

/**
 * GET /api/auth/verify-email?token=…
 * Idempotent: re-using a token returns "already_verified" rather than 4xx
 * because the user simply clicked the email link twice.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  const result = await consumeEmailVerification(token);
  if (result.ok) {
    return NextResponse.json({ verified: true });
  }
  // Map reason → status so the UI can show the right copy.
  const status =
    result.reason === "expired" ? 410 : result.reason === "invalid" ? 400 : 409;
  return NextResponse.json(
    { verified: false, reason: result.reason },
    { status }
  );
}
