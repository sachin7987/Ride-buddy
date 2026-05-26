import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SearchLoading() {
  return (
    <div>
      <div className="border-b bg-muted/30">
        <div className="container max-w-6xl py-4">
          <Skeleton className="h-12 w-full max-w-3xl mx-auto" />
        </div>
      </div>
      <div className="container max-w-6xl py-6 space-y-3">
        <Skeleton className="h-5 w-48" />
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <div className="flex sm:flex-col items-end gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
