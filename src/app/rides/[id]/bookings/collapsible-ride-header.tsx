"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Ride header card used on the driver's "ride bookings" page.
 *
 * For finished rides (completed / cancelled) the heavy block of stats and
 * controls isn't actionable, so we collapse it by default and show just the
 * compact summary (date, route, vehicle, status). Clicking the summary
 * expands the details. For active rides we render everything expanded and
 * non-collapsible, since the driver needs the controls at a glance.
 */
export function CollapsibleRideHeader({
  title,
  badge,
  collapsible,
  defaultExpanded,
  children,
}: {
  title: React.ReactNode;
  badge: React.ReactNode;
  collapsible: boolean;
  defaultExpanded: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!collapsible) {
    return (
      <Card className="mt-3">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">{title}</div>
            {badge}
          </div>
          {children}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-3">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="w-full text-left p-6 rounded-2xl hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">{title}</div>
            <div className="flex items-center gap-2 shrink-0">
              {badge}
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  expanded && "rotate-180"
                )}
                aria-hidden="true"
              />
            </div>
          </div>
          {!expanded && (
            <p className="mt-2 text-xs text-muted-foreground">
              Tap to view stats &amp; details
            </p>
          )}
        </button>
        {expanded && (
          <div className="px-6 pb-6 -mt-2 animate-fade-in">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
