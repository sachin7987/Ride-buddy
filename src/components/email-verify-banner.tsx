"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, X, Loader2, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "ridebuddy.emailVerifyDismissed";

/**
 * Top-of-page banner shown to signed-in users whose email isn't verified.
 *
 * • Dismissal is cached in localStorage but only for 12 hours, so we don't
 *   nag every page load yet eventually re-surface the banner.
 * • The "Resend" button hits /api/auth/resend-verification which has a
 *   60-second per-user cooldown server-side.
 */
export function EmailVerifyBanner({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (Number.isNaN(ts)) return false;
    return Date.now() - ts < 12 * 60 * 60 * 1000;
  });
  const [busy, setBusy] = useState(false);

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }
  }

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
        toast.success("Your email is already verified — refresh the page!", {
          icon: <ShieldCheck className="h-4 w-4" />,
        });
        setDismissed(true);
        return;
      }
      toast.success("Verification email sent", {
        description: data?.delivered
          ? `Check ${email}`
          : "Open the server logs to grab the link.",
      });
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 text-amber-900">
      <div className="container py-2.5 flex flex-wrap items-center gap-3">
        <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
        <p className="flex-1 min-w-0 text-sm leading-snug">
          Please verify your email address.{" "}
          <span className="text-amber-900/80 hidden sm:inline">
            We sent a confirmation link to{" "}
            <strong className="font-semibold">{email}</strong>.
          </span>
        </p>
        <button
          type="button"
          onClick={resend}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold hover:bg-amber-100 disabled:opacity-50 transition-colors"
        >
          {busy && <Loader2 className="h-3 w-3 animate-spin" />}
          Resend email
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="p-1 rounded hover:bg-amber-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
