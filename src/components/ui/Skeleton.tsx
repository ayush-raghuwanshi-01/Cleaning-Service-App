import { cn } from "@/lib/utils";

/** Base shimmering skeleton block. Compose into page-specific skeletons. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-xl", className)} />;
}

/** Skeleton for a service card (used in grids while the catalog loads). */
export function ServiceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/** Skeleton for a row in an order list. */
export function OrderRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="w-full space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
    </div>
  );
}

/** Grid of N skeleton service cards. */
export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
}
