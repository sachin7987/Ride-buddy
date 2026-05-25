import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isDriver as roleIsDriver, isPassenger as roleIsPassenger } from "@/lib/roles";

export async function getSession() {
  return getServerSession(authOptions);
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
