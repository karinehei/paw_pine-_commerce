import { ProductGridSkeleton } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <ProductGridSkeleton count={4} />
    </div>
  );
}
