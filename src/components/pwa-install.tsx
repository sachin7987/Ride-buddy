"use client";
import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Module-level flag — resets on full page reload, but survives across
// client-side route changes. This means:
//   • If the user dismisses the banner, it stays hidden for the rest of
//     this page session (no flicker on every navigation).
//   • A full refresh gives them another chance to install.
let dismissedThisSession = false;

function isStandalone() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // @ts-expect-error: non-standard but used by iOS Safari
  if (window.navigator.standalone === true) return true;
  return false;
}

export function PwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [showIosHint, setShowIosHint] = useState(false);
  const [open, setOpen] = useState(false);

  // Register the service worker once on mount.
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* PWA install will still work without SW on supported browsers */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // Listen for the install prompt event (Chrome/Edge/Android).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone() || dismissedThisSession) return;

    function handler(e: Event) {
      e.preventDefault();
      // Guard in case the browser re-fires the event after dismissal.
      if (dismissedThisSession) return;
      setDeferred(e as BeforeInstallPromptEvent);
      setOpen(true);
    }
    window.addEventListener("beforeinstallprompt", handler);

    // Detect iOS Safari (no beforeinstallprompt event support).
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
    if (isIos && isSafari) {
      const t = setTimeout(() => {
        if (dismissedThisSession) return;
        setShowIosHint(true);
        setOpen(true);
      }, 4000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    dismissedThisSession = true;
    setOpen(false);
  }

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    // Whether the user accepted or dismissed Chrome's native prompt,
    // we don't want to nag them again until next refresh.
    dismissedThisSession = true;
    setOpen(false);
    setDeferred(null);
  }

  if (!open || (!deferred && !showIosHint)) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1500] w-[calc(100%-2rem)] max-w-md animate-fade-in">
      <div className="rounded-2xl border bg-background shadow-2xl p-4 pr-3 flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install RideBuddy</p>
          {showIosHint ? (
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              Tap{" "}
              <Share className="inline h-3 w-3 mx-0.5 -mt-0.5" /> Share, then{" "}
              <strong>Add to Home Screen</strong> to install.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              Add it to your home screen for instant access — works offline,
              no app store required.
            </p>
          )}
          {!showIosHint && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="gradient"
                onClick={install}
                className="h-8"
              >
                Install
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={dismiss}
                className="h-8"
              >
                Not now
              </Button>
            </div>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
