"use client";

import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";
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
  const t = useMessages();
  return (
    <article>
      <LocaleLink
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
        <div className="bg-stone relative aspect-[4/5] overflow-hidden">
          <ProductMedia product={product} image={product.featuredImage} />
          {!product.availableForSale ? (
            <span className="bg-paper text-muted absolute top-3 left-3 px-2 py-1 text-xs tracking-wide uppercase">
              {t.soldOut}
            </span>
          ) : product.tags.includes("new") ? (
            <span className="bg-paper text-ink absolute top-3 left-3 px-2 py-1 text-xs tracking-wide uppercase">
              {t.newShort}
            </span>
          ) : null}
        </div>
        <div className="mt-3 space-y-1.5">
          <p className="text-muted text-[0.7rem] tracking-[0.16em] uppercase">
            {product.vendor}
          </p>
          <h3 className="text-ink group-hover:text-pine text-sm font-medium text-pretty md:text-base">
            {product.title}
          </h3>
          <ProductPrice
            price={product.priceRange.minVariantPrice}
            compareAtPrice={product.compareAtPriceRange.minVariantPrice}
            className="text-sm"
          />
        </div>
      </LocaleLink>
    </article>
  );
}
