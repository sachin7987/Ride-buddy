import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Loading skeleton for the driver's "Manage bookings" page
 * (/rides/[id]/bookings). Mirrors the real layout: back link → ride header
 * card with a 4-stat grid + controls → a "passengers" section with rows.
 */
export default function RideBookingsLoading() {
  return (
    <div className="container max-w-4xl py-8">
      {/* Back link */}
      <Skeleton className="h-7 w-20 rounded-full" />

      {/* Ride header card */}
      <Card className="mt-3">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 min-w-0 flex-1">
              <Skeleton className="h-3 w-44" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full shrink-0" />
          </div>

          {/* Quick stats (4) */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border bg-muted/30 px-3 py-3 space-y-2"
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-5 pt-5 border-t space-y-3">
            <Skeleton className="h-3 w-24" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passengers section */}
      <div className="mt-6 px-1 space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-60" />
      </div>
      <div className="mt-2 space-y-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                  <div className="space-y-2 min-w-0 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <div className="space-y-2 shrink-0">
                  <Skeleton className="h-4 w-14 ml-auto" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-5 w-20 ml-auto rounded-full" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex gap-2">
                <Skeleton className="h-9 w-32 rounded-lg" />
                <Skeleton className="h-9 w-20 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
