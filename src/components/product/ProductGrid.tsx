import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/commerce/types";

interface ProductGridProps {
  products: Product[];
  listId?: string;
  listName?: string;
}

export function ProductGrid({ products, listId, listName }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} listId={listId} listName={listName} />
        </li>
      ))}
    </ul>
  );
}
