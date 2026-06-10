"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, ShieldCheck } from "lucide-react";

/**
 * Small inline indicator + resend control shown in the profile card.
 *
 * - Verified: green "Email verified" pill, no action.
 * - Unverified: amber pill with a "Resend verification" button that hits
 *   the same cooldown-protected endpoint as the global banner.
 */
export function EmailStatusRow({
  email,
  verified,
}: {
  email: string;
  verified: boolean;
}) {
  const [busy, setBusy] = useState(false);
  // Local optimistic flag — once a user successfully resends from this page
  // we'd rather show a "sent" state than re-render the row from scratch.
  const [sent, setSent] = useState(false);

  async function resend() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Could not send verification email");
        return;
      }
      if (data?.alreadyVerified) {
        toast.success("Your email is already verified — refresh the page!");
        setSent(true);
        return;
      }
      toast.success("Verification email sent", {
        description: data?.delivered
          ? `Check ${email}`
          : "Open the server logs to grab the link.",
      });
      setSent(true);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (verified) {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-medium border border-emerald-200">
        <ShieldCheck className="h-3.5 w-3.5" />
        Email verified
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col items-center gap-1.5">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 px-2.5 py-0.5 text-xs font-medium border border-amber-200">
        <Mail className="h-3.5 w-3.5" />
        Email not verified
      </div>
      <button
        type="button"
        onClick={resend}
        disabled={busy || sent}
        className="text-xs font-medium text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline disabled:opacity-60 disabled:no-underline inline-flex items-center gap-1"
      >
        {busy && <Loader2 className="h-3 w-3 animate-spin" />}
        {sent ? "Verification email sent" : "Resend verification email"}
      </button>
    </div>
  );
}
