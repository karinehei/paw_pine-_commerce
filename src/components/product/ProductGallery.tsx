"use client";

import { useState } from "react";
import { ProductMedia } from "@/components/product/ProductMedia";
import { cn } from "@/lib/format";
import type { Product } from "@/lib/commerce/types";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const images = product.images.length > 0 ? product.images : [product.featuredImage];
  const [active, setActive] = useState(0);
  const current = images[active] ?? product.featuredImage;

  return (
    <div className="space-y-3">
      <div className="aspect-[4/5] overflow-hidden bg-stone">
        <ProductMedia
          product={product}
          image={current}
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
      {images.length > 1 ? (
        <ul className="flex gap-2" aria-label="Product images">
          {images.map((image, index) => (
            <li key={`${image?.url ?? "visual"}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  "min-h-11 min-w-11 overflow-hidden bg-stone",
                  index === active ? "ring-2 ring-pine ring-offset-2" : "opacity-70",
                )}
              >
                <ProductMedia product={product} image={image} sizes="64px" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
