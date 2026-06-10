import { getSession } from "@/lib/session";
import { EmailVerifyBanner } from "./email-verify-banner";

/**
 * Renders the unverified-email banner only for signed-in users whose email
 * hasn't been verified yet. Server-side so the banner doesn't flash in for
 * verified users on hydration.
 */
export async function EmailVerifyBannerSlot() {
  const session = await getSession();
  const user = session?.user as
    | { email?: string; emailVerified?: boolean }
    | undefined;
  if (!user || !user.email) return null;
  if (user.emailVerified) return null;
  return <EmailVerifyBanner email={user.email} />;
}
