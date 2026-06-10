import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Loading skeleton for the live tracker page (/rides/[id]/track).
 * Mirrors the real layout: back link → title → a card holding the live map.
 */
export default function TrackLoading() {
  return (
    <div className="container max-w-4xl py-8">
      <Skeleton className="h-7 w-20 rounded-full" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-60" />
      </div>
      <Card className="mt-6">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-[380px] w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
