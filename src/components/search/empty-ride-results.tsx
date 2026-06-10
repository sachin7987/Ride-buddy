import Link from "next/link";
import { ArrowRight, Bell, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

/**
 * Empty-state shown on /search when no rides match the filters. Designed to
 * feel reassuring and actionable rather than dead-ended:
 *  - A friendly illustration so the page doesn't feel like an error.
 *  - Clear restatement of *what* was searched (route + date) so the user
 *    can spot a typo at a glance.
 *  - One primary CTA (publish a ride / adjust search) and a quick set of
 *    nearby-date links to reduce dead-ends.
 */
export function EmptyRideResults({
  fromCity,
  toCity,
  date,
}: {
  fromCity?: string;
  toCity?: string;
  date?: string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const searchedDate = date ? new Date(date) : today;
  const isToday = searchedDate.getTime() === today.getTime();
  const dateLabel = isToday ? "today" : formatDate(searchedDate);

  // Build "try a nearby date" quick links — yesterday is hidden if the user
  // already searched today (no point offering past dates).
  const tomorrow = new Date(searchedDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(searchedDate);
  dayAfter.setDate(dayAfter.getDate() + 2);

  function buildHref(d: Date) {
    const params = new URLSearchParams();
    if (fromCity) params.set("from", fromCity);
    if (toCity) params.set("to", toCity);
    params.set("date", d.toISOString().slice(0, 10));
    return `/search?${params.toString()}`;
  }

  return (
    <div className="rounded-2xl border bg-card p-8 sm:p-12 text-center">
      <div className="mx-auto max-w-md">
        <RouteIllustration />

        <h2 className="mt-6 text-xl sm:text-2xl font-bold">
          {fromCity && toCity ? (
            <>
              No rides {dateLabel} between{" "}
              <span className="text-brand-700">{fromCity}</span> and{" "}
              <span className="text-brand-700">{toCity}</span>
            </>
          ) : (
            <>No rides found {dateLabel}</>
          )}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Try a different date or route — new rides are published every few
          minutes. Drivers tend to add weekend rides on the day of travel.
        </p>

        {fromCity && toCity && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">
              Try another day:
            </span>
            <DateChip href={buildHref(tomorrow)} label="Tomorrow" date={tomorrow} />
            <DateChip
              href={buildHref(dayAfter)}
              label={null}
              date={dayAfter}
            />
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/publish" className={cn(buttonVariants({ variant: "gradient" }))}>
            <Pencil className="h-4 w-4" />
            Publish your own ride
          </Link>
          <Link href="/search" className={cn(buttonVariants({ variant: "outline" }))}>
            <Bell className="h-4 w-4" />
            Adjust search
          </Link>
        </div>
      </div>
    </div>
  );
}

function DateChip({
  href,
  label,
  date,
}: {
  href: string;
  label: string | null;
  date: Date;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full border border-input bg-background px-3 py-1.5 text-xs font-medium hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors"
    >
      {label && <span>{label}</span>}
      <span className={label ? "text-muted-foreground" : ""}>
        {date.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })}
      </span>
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

/**
 * Inline SVG so the asset ships with the page (no extra request, no flash
 * during paint). Drawn flat in brand greens with a soft mint blob backdrop —
 * matches the brand palette better than a generic "magnifying glass" icon.
 */
function RouteIllustration() {
  return (
    <svg
      viewBox="0 0 200 160"
      className="mx-auto h-32 w-auto"
      role="img"
      aria-label="No rides illustration"
    >
      {/* soft backdrop blob */}
      <ellipse cx="100" cy="100" rx="92" ry="44" fill="#d1fae9" opacity="0.55" />
      <ellipse cx="118" cy="92" rx="60" ry="20" fill="#a6f0d3" opacity="0.55" />

      {/* tiny stars / sparkles */}
      <g stroke="#16a97a" strokeWidth="1.5" strokeLinecap="round">
        <line x1="36" y1="36" x2="36" y2="42" />
        <line x1="33" y1="39" x2="39" y2="39" />
        <line x1="170" y1="48" x2="170" y2="54" />
        <line x1="167" y1="51" x2="173" y2="51" />
        <line x1="160" y1="120" x2="160" y2="124" />
        <line x1="158" y1="122" x2="162" y2="122" />
      </g>

      {/* road that curves between two pins */}
      <path
        d="M52 116 Q 100 60 152 100"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="3"
        strokeDasharray="2 6"
        strokeLinecap="round"
      />

      {/* origin pin (green) */}
      <g transform="translate(40, 96)">
        <path
          d="M12 0 C 5 0 0 5 0 12 C 0 21 12 30 12 30 C 12 30 24 21 24 12 C 24 5 19 0 12 0 Z"
          fill="#16a97a"
        />
        <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
      </g>

      {/* destination pin (rose) */}
      <g transform="translate(140, 80)">
        <path
          d="M12 0 C 5 0 0 5 0 12 C 0 21 12 30 12 30 C 12 30 24 21 24 12 C 24 5 19 0 12 0 Z"
          fill="#f43f5e"
        />
        <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
      </g>

      {/* tiny "? near route" — a small magnifying glass on the curve */}
      <g transform="translate(85, 64)">
        <circle
          cx="10"
          cy="10"
          r="9"
          fill="#ffffff"
          stroke="#0e8862"
          strokeWidth="2.5"
        />
        <line
          x1="17"
          y1="17"
          x2="22"
          y2="22"
          stroke="#0e8862"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
