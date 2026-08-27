"use client";

import Link from "next/link";
import { ProductMedia } from "@/components/product/ProductMedia";
import { ProductPrice } from "@/components/product/ProductPrice";
import { track } from "@/lib/analytics/events";
import { itemFromProduct } from "@/lib/analytics/items";
import type { Product } from "@/lib/commerce/types";

interface ProductCardProps {
  product: Product;
  listId?: string;
  listName?: string;
}

export function ProductCard({ product, listId, listName }: ProductCardProps) {
  return (
    <article>
      <Link
        href={`/products/${product.handle}`}
        className="group block min-h-11 focus-visible:outline-none"
        onClick={() =>
          track({
            name: "select_item",
            item_list_id: listId,
            item_list_name: listName,
            items: [itemFromProduct(product)],
          })
        }
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
        <div className="mt-3 space-y-1.5">
          <p className="text-[0.7rem] tracking-[0.16em] text-muted uppercase">{product.vendor}</p>
          <h3 className="text-sm font-medium text-pretty text-ink group-hover:text-pine md:text-base">
            {product.title}
          </h3>
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
