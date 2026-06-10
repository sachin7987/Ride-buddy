"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Consistent, history-aware "back" affordance used across detail pages.
 *
 * Behaviour (industry-standard "smart back"):
 *  - If the user reached this page via in-app navigation, clicking goes back
 *    to wherever they actually came from (search, my trips, a ride, …) using
 *    the browser history — so the back button always respects the user's path.
 *  - If there's no in-app history (deep link, opened in a new tab, hard
 *    refresh, or arriving from an external site), it navigates to `href` as a
 *    sensible fallback.
 *
 * It still renders a real <Link href={href}> underneath, so middle-click /
 * "open in new tab" and no-JS fallback keep working, and SSR has a real link.
 *
 * Implementation note: Next.js' App Router (unlike the Pages Router) does NOT
 * expose an `idx` on `window.history.state`, so we use `window.history.length`
 * to decide. A length > 1 means the browser has a previous entry to return to
 * (the user navigated here within a session); a length of 1 means this is the
 * only entry (deep link / new tab / hard refresh), so we use the fallback href.
 */
export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Respect new-tab / modified clicks — let the browser handle the <Link>.
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }
    if (canGoBack) {
      e.preventDefault();
      router.back();
    }
    // else: fall through to the <Link> navigation to `href`.
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full",
        "px-3 py-1.5 -ml-3 text-sm font-medium",
        "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        "active:scale-95 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        className
      )}
    >
      <ArrowLeft
        className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
      <span>{children}</span>
    </Link>
  );
}
