import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Loading skeleton for "My trips" (/bookings). Mirrors the real layout:
 * title + subtitle, the passenger/driver switch-mode tabs, then trip cards.
 */
export default function BookingsLoading() {
  return (
    <div className="container max-w-5xl py-6">
      {/* Heading */}
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />

      {/* Switch-mode tabs */}
      <div className="mt-5 inline-flex gap-1 rounded-xl border bg-muted/40 p-1">
        <Skeleton className="h-9 w-40 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Trip cards */}
      <div className="mt-5 space-y-4">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 min-w-0 flex-1">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <div className="space-y-1.5 shrink-0">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full ml-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
