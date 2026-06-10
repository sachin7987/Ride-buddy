import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Loading skeleton for the passenger's booking detail page (/bookings/[id]).
 * Mirrors the real layout: back link → two-column grid with a ride summary
 * card + driver/chat cards on the left and an actions sidebar on the right.
 */
export default function BookingDetailLoading() {
  return (
    <div className="container max-w-4xl py-8">
      <Skeleton className="h-7 w-20 rounded-full" />
      <div className="mt-4 grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Main column */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 min-w-0 flex-1">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-7 w-3/4" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full shrink-0" />
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-5 w-28" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
