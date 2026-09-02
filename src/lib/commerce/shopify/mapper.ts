import type {
  Cart,
  Collection,
  Money,
  Product,
  ProductCategory,
  ProductImage,
  ProductShape,
  ProductVariant,
  ProductVisual,
  Species,
} from "@/lib/commerce/types";
import type {
  ShopifyCartNode,
  ShopifyCollectionNode,
  ShopifyImage,
  ShopifyMoney,
  ShopifyProductNode,
  ShopifyVariantNode,
} from "@/lib/commerce/shopify/storefront-types";
import { quoteShopifySearchTerm } from "@/lib/security";
import { shopifyCatalogQueryClause } from "@/lib/commerce/catalog-scope";
import { multiplyMoney, parseAmount } from "@/lib/format";

const CATEGORIES: ProductCategory[] = [
  "toys",
  "harnesses",
  "beds",
  "feeding",
  "scratching",
];
const SHAPES: ProductShape[] = [
  "ring",
  "rope",
  "harness",
  "bed",
  "raised-bed",
  "bowl",
  "slow-bowl",
  "mice",
  "wand",
  "column",
  "panel",
  "perch",
  "cave",
  "dish",
  "puzzle",
];
const PALETTES: Array<{ background: string; accent: string }> = [
  { background: "#E4D3B8", accent: "#8B5E34" },
  { background: "#C9D1C4", accent: "#2C4538" },
  { background: "#E7D9C6", accent: "#A58B6A" },
  { background: "#D8DCD4", accent: "#6A7568" },
  { background: "#E6DED2", accent: "#8A7B6A" },
  { background: "#E8E2D6", accent: "#4C6A7A" },
];

function mapMoney(money: ShopifyMoney | null | undefined): Money | null {
  if (!money?.amount) {
    return null;
  }
  return { amount: money.amount, currencyCode: money.currencyCode || "EUR" };
}

function mapImage(
  image: ShopifyImage | null | undefined,
  fallbackAlt: string,
): ProductImage | null {
  if (!image?.url) {
    return null;
  }

  return {
    url: image.url,
    altText: image.altText?.trim() || fallbackAlt,
    width: image.width ?? 1200,
    height: image.height ?? 1500,
  };
}

function tagValue(tags: string[], prefix: string): string | undefined {
  const match = tags.find((tag) => tag.toLowerCase().startsWith(`${prefix}:`));
  return match?.slice(prefix.length + 1).trim();
}

function mapSpecies(product: ShopifyProductNode): Species {
  const tagged = tagValue(product.tags, "species")?.toLowerCase();
  if (tagged === "cat" || tagged === "dog") {
    return tagged;
  }
  const lowered = product.tags.map((tag) => tag.toLowerCase());
  if (lowered.includes("cat") || product.productType.toLowerCase().includes("cat")) {
    return "cat";
  }
  return "dog";
}

function mapCategory(product: ShopifyProductNode): ProductCategory {
  const tagged = tagValue(product.tags, "category")?.toLowerCase();
  if (tagged && CATEGORIES.includes(tagged as ProductCategory)) {
    return tagged as ProductCategory;
  }
  const type = product.productType.toLowerCase();
  const fromType = CATEGORIES.find((category) => type.includes(category));
  return fromType ?? "toys";
}

function hashString(value: string): number {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function mapVisual(handle: string): ProductVisual {
  const palette = PALETTES[hashString(handle) % PALETTES.length] ?? {
    background: "#E4D3B8",
    accent: "#8B5E34",
  };
  const shape = SHAPES[hashString(handle) % SHAPES.length] ?? "bowl";
  return {
    background: palette.background,
    accent: palette.accent,
    shape,
  };
}

function mapVariant(node: ShopifyVariantNode, productTitle: string): ProductVariant {
  return {
    id: node.id,
    title: node.title,
    availableForSale: node.availableForSale,
    quantityAvailable: node.quantityAvailable ?? null,
    selectedOptions: node.selectedOptions,
    price: mapMoney(node.price) ?? { amount: "0.00", currencyCode: "EUR" },
    compareAtPrice: mapMoney(node.compareAtPrice),
    image: mapImage(node.image, productTitle),
  };
}

function extractFeatures(description: string, tags: string[]): string[] {
  const fromTags = tags
    .filter((tag) => tag.toLowerCase().startsWith("feature:"))
    .map((tag) => tag.slice("feature:".length).trim())
    .filter(Boolean);

  if (fromTags.length > 0) {
    return fromTags;
  }

  return description
    .split("\n")
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter((line) => line.length > 12 && line.length < 80)
    .slice(0, 3);
}

export function mapProduct(node: ShopifyProductNode): Product {
  const images = (node.images?.nodes ?? [])
    .map((image) => mapImage(image, node.title))
    .filter((image): image is ProductImage => Boolean(image));
  const featured = mapImage(node.featuredImage, node.title) ?? images[0] ?? null;
  const description = node.description ?? "";
  const features = extractFeatures(description, node.tags);

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description,
    descriptionHtml: node.descriptionHtml ?? "",
    availableForSale: node.availableForSale,
    featuredImage: featured,
    images: images.length > 0 ? images : featured ? [featured] : [],
    priceRange: {
      minVariantPrice: mapMoney(node.priceRange.minVariantPrice) ?? {
        amount: "0.00",
        currencyCode: "EUR",
      },
      maxVariantPrice: mapMoney(node.priceRange.maxVariantPrice) ?? {
        amount: "0.00",
        currencyCode: "EUR",
      },
    },
    compareAtPriceRange: {
      minVariantPrice: mapMoney(node.compareAtPriceRange.minVariantPrice),
      maxVariantPrice: mapMoney(node.compareAtPriceRange.maxVariantPrice),
    },
    variants: (node.variants?.nodes ?? []).map((variant) =>
      mapVariant(variant, node.title),
    ),
    options: (node.options ?? []).filter(
      (option) => option.name?.toLowerCase() !== "title",
    ),
    tags: node.tags,
    vendor: node.vendor ?? "",
    productType: node.productType ?? "",
    species: mapSpecies(node),
    category: mapCategory(node),
    material: tagValue(node.tags, "material") || node.vendor || "",
    features,
    createdAt: node.createdAt,
    visual: mapVisual(node.handle),
    sku: tagValue(node.tags, "sku") || node.handle,
    dimensions: tagValue(node.tags, "dimensions") || "See the product images for scale.",
    care: tagValue(node.tags, "care") || "Wipe clean. Avoid harsh chemicals.",
  };
}

export function mapCollection(node: ShopifyCollectionNode): Collection {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    image: mapImage(node.image, node.title),
  };
}

export function mapCart(node: ShopifyCartNode): Cart {
  const currency =
    mapMoney(node.cost?.subtotalAmount)?.currencyCode ??
    mapMoney(node.cost?.totalAmount)?.currencyCode ??
    "EUR";
  const lines = (node.lines?.nodes ?? []).flatMap((line) => {
    const merchandise = line.merchandise;
    if (!line.quantity || line.quantity < 1 || !merchandise?.id) {
      return [];
    }

    const unit =
      mapMoney(merchandise.price) ??
      mapMoney(line.cost?.amountPerQuantity) ??
      ({ amount: "0.00", currencyCode: currency } satisfies Money);
    const reportedTotal = mapMoney(line.cost?.totalAmount);
    const totalAmount =
      reportedTotal && parseAmount(reportedTotal) > 0
        ? reportedTotal
        : multiplyMoney(unit, line.quantity);

    return [
      {
        id: line.id,
        quantity: line.quantity,
        merchandise: {
          id: merchandise.id,
          title: merchandise.title,
          selectedOptions: merchandise.selectedOptions ?? [],
          price: unit,
          image: mapImage(
            merchandise.image,
            merchandise.product?.title ?? merchandise.title,
          ),
          product: {
            handle: merchandise.product?.handle ?? "",
            title: merchandise.product?.title ?? merchandise.title,
            visual: mapVisual(merchandise.product?.handle ?? merchandise.id),
          },
        },
        cost: { totalAmount },
      },
    ];
  });

  const subtotal = lines.reduce((sum, line) => sum + parseAmount(line.cost.totalAmount), 0);
  const reportedSubtotal = mapMoney(node.cost?.subtotalAmount);
  const reportedTotal = mapMoney(node.cost?.totalAmount);
  const subtotalAmount =
    lines.length > 0 && reportedSubtotal && parseAmount(reportedSubtotal) > 0
      ? reportedSubtotal
      : { amount: subtotal.toFixed(2), currencyCode: currency };

  return {
    id: node.id,
    checkoutUrl: node.checkoutUrl,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    lines,
    cost: {
      subtotalAmount,
      totalAmount: reportedTotal && parseAmount(reportedTotal) > 0 ? reportedTotal : subtotalAmount,
    },
  };
}

export function buildShopifySearchQuery(input: {
  query?: string;
  species?: string[];
  category?: string[];
  brand?: string[];
  availability?: string;
}): string | undefined {
  const parts: string[] = [shopifyCatalogQueryClause()];

  if (input.query) {
    parts.push(quoteShopifySearchTerm(input.query));
  }
  if (input.species?.length) {
    parts.push(
      `(${input.species.map((value) => `tag:${quoteShopifySearchTerm(value)}`).join(" OR ")})`,
    );
  }
  if (input.category?.length) {
    parts.push(
      `(${input.category.map((value) => `product_type:${quoteShopifySearchTerm(value)}`).join(" OR ")})`,
    );
  }
  if (input.brand?.length) {
    parts.push(
      `(${input.brand.map((value) => `vendor:${quoteShopifySearchTerm(value)}`).join(" OR ")})`,
    );
  }
  if (input.availability === "in-stock") {
    parts.push("available_for_sale:true");
  }

  return parts.join(" ");
}

export function toShopifyProductSort(sort?: string): {
  sortKey: string;
  reverse: boolean;
} {
  switch (sort) {
    case "newest":
      return { sortKey: "CREATED_AT", reverse: true };
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    default:
      return { sortKey: "BEST_SELLING", reverse: false };
  }
}

export function toShopifyCollectionSort(sort?: string): {
  sortKey: string;
  reverse: boolean;
} {
  switch (sort) {
    case "newest":
      return { sortKey: "CREATED", reverse: true };
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    default:
      return { sortKey: "BEST_SELLING", reverse: false };
  }
}
