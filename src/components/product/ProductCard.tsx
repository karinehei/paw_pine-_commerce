import Link from "next/link";
import { ProductMedia } from "@/components/product/ProductMedia";
import { ProductPrice } from "@/components/product/ProductPrice";
import type { Product } from "@/lib/commerce/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article>
      <Link
        href={`/products/${product.handle}`}
        className="group block focus-visible:outline-none"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-stone">
          <ProductMedia product={product} image={product.featuredImage} />
          {!product.availableForSale ? (
            <span className="absolute top-3 left-3 bg-paper px-2 py-1 text-xs tracking-wide text-muted uppercase">
              Sold out
            </span>
          ) : product.tags.includes("new") ? (
            <span className="absolute top-3 left-3 bg-paper px-2 py-1 text-xs tracking-wide text-ink uppercase">
              New
            </span>
          ) : null}
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs tracking-[0.16em] text-muted uppercase">{product.vendor}</p>
          <h3 className="font-medium text-ink group-hover:text-pine">{product.title}</h3>
          <ProductPrice
            price={product.priceRange.minVariantPrice}
            compareAtPrice={product.compareAtPriceRange.minVariantPrice}
            className="text-sm"
          />
        </div>
      </Link>
    </article>
  );
}
