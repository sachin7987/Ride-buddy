import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Consistent "back" affordance used across detail pages.
 *
 * - Uses a lucide icon so it renders identically on every platform
 *   (the Unicode `←` glyph varies between Apple, Windows, Android & web fonts).
 * - Clear, comfortable touch target (~36px tall) without looking heavy.
 * - Subtle pill hover state + focus ring for keyboard/SR users.
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
  return (
    <Link
      href={href}
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
