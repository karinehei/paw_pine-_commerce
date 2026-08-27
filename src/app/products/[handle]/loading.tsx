import { ProductDetailSkeleton } from "@/components/ui/LoadingSkeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
      <ProductDetailSkeleton />
    </div>
  );
}
