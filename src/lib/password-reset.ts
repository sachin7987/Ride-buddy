import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { buildPasswordResetEmail, sendMail } from "@/lib/mailer";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Issues a password-reset token for the account with `email` (if one exists)
 * and emails the reset link. Always resolves the same way regardless of whether
 * the email is registered — callers must NOT leak account existence to the
 * client. Returns a `devUrl` (non-production only) so local dev can grab the
 * link from the console/response without a configured mail provider.
 */
export async function issuePasswordReset(email: string) {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, email: true, name: true },
  });

  // Silently no-op for unknown emails — never reveal whether an account exists.
  if (!user) {
    return { sent: false as const, devUrl: undefined };
  }

  // Invalidate any previous still-valid reset tokens so links don't pile up.
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const { subject, html, text, url } = buildPasswordResetEmail({
    name: user.name,
    token,
  });
  await sendMail({ to: user.email, subject, html, text });

  return {
    sent: true as const,
    devUrl: process.env.NODE_ENV !== "production" ? url : undefined,
  };
}

/**
 * Validates a reset token without consuming it — used to decide whether to
 * render the "set a new password" form or an error state.
 */
export async function verifyResetToken(token: string): Promise<
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "used" }
> {
  const row = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: { usedAt: true, expiresAt: true },
  });
  if (!row) return { ok: false, reason: "invalid" };
  if (row.usedAt) return { ok: false, reason: "used" };
  if (row.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true };
}

/**
 * Consumes a reset token and updates the user's password in one transaction.
 * Returns `{ ok: true }` on success or an error reason for the UI to map.
 */
export async function consumePasswordReset(
  token: string,
  newPassword: string
): Promise<
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "used" }
> {
  const row = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: { id: true, userId: true, usedAt: true, expiresAt: true },
  });
  if (!row) return { ok: false, reason: "invalid" };
  if (row.usedAt) return { ok: false, reason: "used" };
  if (row.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    // Invalidate any other outstanding reset tokens for this user.
    prisma.passwordResetToken.updateMany({
      where: { userId: row.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true };
}
