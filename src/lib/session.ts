import { getServerSession, type Session } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { isDriver as roleIsDriver, isPassenger as roleIsPassenger } from "@/lib/roles";

/**
 * Resolves the current user from either:
 *  1. the NextAuth session cookie (web), or
 *  2. an `Authorization: Bearer <token>` header (mobile app).
 *
 * Because every API route and server component already calls `getSession()`,
 * adding the Bearer fallback here makes the entire existing API usable by the
 * native app with no per-route changes.
 */
export async function getSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (session?.user) return session;

  // Mobile bearer-token fallback.
  let authHeader: string | null = null;
  try {
    authHeader = headers().get("authorization");
  } catch {
    // headers() is unavailable outside a request scope — ignore.
  }
  if (authHeader?.startsWith("Bearer ")) {
    const userId = verifyMobileToken(authHeader.slice(7).trim());
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          kycStatus: true,
          isAdmin: true,
          emailVerified: true,
        },
      });
      if (user) {
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatarUrl ?? undefined,
            role: user.role,
            kycStatus: user.kycStatus,
            isAdmin: user.isAdmin,
            emailVerified: user.emailVerified,
          },
        } as unknown as Session;
      }
    }
  }

  return null;
}

export async function requireUser(redirectTo = "/auth/signin") {
  const session = await getSession();
  if (!session?.user) redirect(redirectTo);
  return session.user;
}

export async function requireVerified(redirectTo = "/kyc") {
  const user = await requireUser();
  if (user.kycStatus !== "VERIFIED") redirect(redirectTo);
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) redirect("/");
  return user;
}

/** Returns the current user, or `null` if they aren't a driver
 *  (the page should render `<DriverOnlyGate />` instead of redirecting). */
export async function getDriverUser() {
  const user = await requireUser();
  if (!roleIsDriver((user as any).role)) return null;
  return user;
}

export function userIsDriver(user: { role?: string | null } | null | undefined) {
  return roleIsDriver(user?.role);
}

export function userIsPassenger(user: { role?: string | null } | null | undefined) {
  return roleIsPassenger(user?.role);
}
