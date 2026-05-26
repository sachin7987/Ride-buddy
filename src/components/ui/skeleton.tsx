import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/70", className)}
      {...props}
    />
  );
}

/** A generic page-level skeleton used as a fallback for `loading.tsx`. */
export function PageSkeleton({
  title = true,
  cards = 2,
}: {
  title?: boolean;
  cards?: number;
}) {
  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {title && (
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      )}
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border bg-card p-6 space-y-3"
        >
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
