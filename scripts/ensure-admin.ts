/**
 * Bootstrap script — guarantees a permanent owner/admin account exists in
 * whatever database the app is pointing at.
 *
 * Wired into the Vercel build command so it runs on every deployment.
 * Safe to run repeatedly: it upserts the user (never deletes anything) and
 * re-hashes the password on each run so an out-of-band rotation in env vars
 * propagates immediately on the next deploy.
 *
 * Configure via env vars (NEVER hard-code credentials in source — the repo
 * is public):
 *   ADMIN_EMAIL     — login email for the permanent admin
 *   ADMIN_PASSWORD  — plaintext password (will be bcrypt-hashed)
 *   ADMIN_NAME      — optional display name (default: "Owner")
 *   ADMIN_PHONE     — optional E.164/local phone (default: "0000000000")
 *
 * If ADMIN_EMAIL or ADMIN_PASSWORD aren't set, the script exits cleanly with
 * a warning rather than failing the build.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Owner";
  const phone = process.env.ADMIN_PHONE?.trim() || "0000000000";

  if (!email || !password) {
    console.warn(
      "[ensure-admin] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping. " +
        "Add them to your env to provision a permanent admin."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      // Keep the admin flag and verification status pinned, and rotate
      // the password hash + display name on every deploy.
      isAdmin: true,
      kycStatus: "VERIFIED",
      role: "BOTH",
      passwordHash,
      name,
    },
    create: {
      email,
      phone,
      name,
      passwordHash,
      isAdmin: true,
      kycStatus: "VERIFIED",
      role: "BOTH",
    },
  });

  console.log(
    `[ensure-admin] ✓ Admin guaranteed: ${user.email} (id=${user.id})`
  );
}

main()
  .catch((err) => {
    // Don't fail the build on bootstrap errors — the app should still come up.
    // Surface the error loudly so it shows in Vercel logs.
    console.error("[ensure-admin] failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
