import Image from "next/image";
import { ProductStillLife } from "@/components/product/ProductStillLife";
import { productAlt } from "@/lib/format";
import type { Product, ProductImage, ProductVisual } from "@/lib/commerce/types";

interface ProductMediaProps {
  product: Pick<Product, "title" | "visual">;
  image?: ProductImage | null;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

function isRemote(url: string | undefined): boolean {
  return Boolean(url?.startsWith("http://") || url?.startsWith("https://"));
}

export function ProductMedia({
  product,
  image,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw",
}: ProductMediaProps) {
  if (image && isRemote(image.url)) {
    return (
      <Image
        src={image.url}
        alt={image.altText || productAlt(product)}
        width={image.width}
        height={image.height}
        className={`h-full w-full object-cover ${className}`}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <ProductStillLife
      title={image?.altText || productAlt(product)}
      visual={product.visual}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

export function visualFromProduct(product: Pick<Product, "visual">): ProductVisual {
  return product.visual;
}
