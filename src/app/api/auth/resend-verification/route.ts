import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { issueEmailVerification } from "@/lib/email-verification";

/** Per-user cooldown so the resend button can't be hammered into spam. */
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

/**
 * POST /api/auth/resend-verification
 * Auth-gated: must be signed in. Honours a per-user cooldown so users can't
 * spam themselves (and we don't blow our email quota).
 */
export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, emailVerified: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ alreadyVerified: true });
  }

  // Cooldown — block if an unused, unexpired token was issued in the last
  // RESEND_COOLDOWN_MS milliseconds.
  const since = new Date(Date.now() - RESEND_COOLDOWN_MS);
  const recent = await prisma.emailVerificationToken.findFirst({
    where: { userId: user.id, createdAt: { gt: since } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (recent) {
    const waitMs =
      RESEND_COOLDOWN_MS - (Date.now() - recent.createdAt.getTime());
    return NextResponse.json(
      {
        error: `Please wait ${Math.ceil(waitMs / 1000)} seconds before retrying.`,
        retryAfterSec: Math.ceil(waitMs / 1000),
      },
      { status: 429 }
    );
  }

  const result = await issueEmailVerification(user.id);
  return NextResponse.json({
    sent: true,
    delivered: "delivered" in result ? result.delivered : true,
    devUrl: "devUrl" in result ? result.devUrl : undefined,
  });
}
