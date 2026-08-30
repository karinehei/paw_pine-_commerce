import { ProductGridSkeleton } from "@/components/ui/LoadingSkeleton";

export default function CollectionLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
      <div className="bg-stone mb-10 h-10 w-48 animate-pulse" />
      <ProductGridSkeleton />
    </div>
  );
}
