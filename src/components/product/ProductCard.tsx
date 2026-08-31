"use client";

import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";
import { ProductMedia } from "@/components/product/ProductMedia";
import { ProductPrice } from "@/components/product/ProductPrice";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { track } from "@/lib/analytics/events";
import { itemFromProduct } from "@/lib/analytics/items";
import { hasSalePrice } from "@/lib/format";
import type { Product } from "@/lib/commerce/types";

interface ProductCardProps {
  product: Product;
  listId?: string;
  listName?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  listId,
  listName,
  priority = false,
}: ProductCardProps) {
  const t = useMessages();
  const hoverImage = product.images.find(
    (image) => image.url && image.url !== product.featuredImage?.url,
  );
  const badge = !product.availableForSale
    ? t.soldOut
    : hasSalePrice(product)
      ? t.sale
      : product.tags.includes("new")
        ? t.newShort
        : product.tags.includes("bestseller")
          ? t.popular
          : null;

  return (
    <article className="relative">
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton product={product} compact />
      </div>
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
          <div className="h-full w-full">
            <ProductMedia
              product={product}
              image={product.featuredImage}
              priority={priority}
            />
          </div>
          {hoverImage ? (
            <div className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-200 md:block md:group-hover:opacity-100">
              <ProductMedia product={product} image={hoverImage} />
            </div>
          ) : null}
          {badge ? (
            <span className="bg-paper text-ink absolute top-3 left-3 px-2 py-1 text-[0.65rem] tracking-wide uppercase">
              {badge}
            </span>
          ) : null}
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-label text-muted">{product.vendor}</p>
          <h3 className="text-ink group-hover:text-pine text-sm text-pretty md:text-base">
            {product.title}
          </h3>
          <ProductPrice
            price={product.priceRange.minVariantPrice}
            compareAtPrice={product.compareAtPriceRange.minVariantPrice}
            className="text-sm"
            showSavings
          />
        </div>
      </LocaleLink>
    </article>
  );
}
