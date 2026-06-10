import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildVerificationEmail, sendMail } from "@/lib/mailer";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Mints a fresh verification token for a user, stores it (with a 24h TTL),
 * and emails them the verify link. Safe to call for an already-verified
 * user: returns `{ alreadyVerified: true }` and does nothing.
 *
 * Returns the verification URL too — useful for tests and dev-mode console
 * fallback so the developer can grab it from the API response.
 */
export async function issueEmailVerification(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, emailVerified: true },
  });
  if (!user) throw new Error("User not found");
  if (user.emailVerified) {
    return { alreadyVerified: true as const };
  }

  // Invalidate previous still-valid tokens so resends don't pile up.
  await prisma.emailVerificationToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const { subject, html, text, url } = buildVerificationEmail({
    name: user.name,
    token,
  });
  const result = await sendMail({
    to: user.email,
    subject,
    html,
    text,
  });

  return {
    alreadyVerified: false as const,
    delivered: result.delivered,
    provider: result.provider,
    /** Only returned in non-production so dev can copy/paste the URL. */
    devUrl: process.env.NODE_ENV !== "production" ? url : undefined,
  };
}

/**
 * Consumes a token. Returns `{ ok: true, userId }` on success, otherwise an
 * error reason that the UI can map to a human message.
 */
export async function consumeEmailVerification(token: string): Promise<
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "expired" | "used" | "already_verified" }
> {
  const row = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: {
      user: { select: { id: true, emailVerified: true } },
    },
  });
  if (!row) return { ok: false, reason: "invalid" };
  if (row.user.emailVerified) {
    return { ok: false, reason: "already_verified" };
  }
  if (row.usedAt) return { ok: false, reason: "used" };
  if (row.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerified: true },
    }),
  ]);

  // The unverified-email banner lives in the root layout. Without busting its
  // cache, future navigations to `/` would still render the stale "please
  // verify" version. Invalidating "/" with `type: "layout"` clears the RSC
  // cache for the root layout segment so the next render reads the fresh
  // emailVerified flag from the session.
  try {
    revalidatePath("/", "layout");
  } catch {
    // revalidatePath throws when called outside a request context (e.g. tests).
    // It's a best-effort cache bust — safe to ignore failures.
  }

  return { ok: true, userId: row.userId };
}
