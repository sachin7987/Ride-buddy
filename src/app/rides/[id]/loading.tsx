import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function RideDetailLoading() {
  return (
    <div className="container max-w-5xl py-8">
      <Skeleton className="h-4 w-24" />
      <div className="mt-4 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-7 w-3/4" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-8 w-20 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-[280px] w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
