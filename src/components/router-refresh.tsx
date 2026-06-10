"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Drop-in client component to invalidate Next.js's client-side router cache
 * once after mounting. We render this on the verify-email success page so
 * the next navigation to `/` re-fetches the layout (which renders the
 * unverified-email banner) instead of replaying the prefetched stale copy.
 */
export function RouterRefresh() {
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, [router]);
  return null;
}
