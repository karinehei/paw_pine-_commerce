import { cn } from "@/lib/format";

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("bg-stone animate-pulse", className)} aria-hidden="true" />;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3">
          <LoadingSkeleton className="aspect-[4/5]" />
          <LoadingSkeleton className="h-3 w-16" />
          <LoadingSkeleton className="h-4 w-3/4" />
          <LoadingSkeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div
      className="grid gap-10 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Loading product"
    >
      <LoadingSkeleton className="aspect-[4/5]" />
      <div className="space-y-4 pt-4">
        <LoadingSkeleton className="h-3 w-24" />
        <LoadingSkeleton className="h-10 w-2/3" />
        <LoadingSkeleton className="h-5 w-20" />
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
