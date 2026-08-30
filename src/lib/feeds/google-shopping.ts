import { DEFAULT_CURRENCY, SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { xmlElement } from "@/lib/feeds/xml";
import type { Money, Product } from "@/lib/commerce/types";

export type GoogleAvailability = "in_stock" | "out_of_stock";

export interface GoogleShoppingItem {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink?: string;
  availability: GoogleAvailability;
  price: string;
  brand?: string;
  condition: "new";
  productType?: string;
}

export function absoluteUrl(siteUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const origin = siteUrl.replace(/\/$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${path}`;
}

export function formatEurPrice(money: Money): string | null {
  if (money.currencyCode !== DEFAULT_CURRENCY) {
    return null;
  }
  const amount = Number.parseFloat(money.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }
  return `${amount.toFixed(2)} EUR`;
}

export function toGoogleShoppingItem(
  product: Product,
  siteUrl: string,
): GoogleShoppingItem | null {
  const handle = product.handle.trim();
  const title = product.title.trim();
  const price = formatEurPrice(product.priceRange.minVariantPrice);
  if (!handle || !title || !price) {
    return null;
  }

  const imageUrl =
    product.featuredImage?.url || product.images.find((image) => image.url)?.url;
  const brand = product.vendor.trim();
  const productType = (product.productType || product.category).trim();
  const description = product.description.replace(/\s+/g, " ").trim() || title;

  const item: GoogleShoppingItem = {
    id: handle,
    title,
    description,
    link: absoluteUrl(siteUrl, `/products/${handle}`),
    availability: product.availableForSale ? "in_stock" : "out_of_stock",
    price,
    condition: "new",
  };
  if (imageUrl) {
    item.imageLink = absoluteUrl(siteUrl, imageUrl);
  }
  if (brand) {
    item.brand = brand;
  }
  if (productType) {
    item.productType = productType;
  }
  return item;
}

export function buildGoogleShoppingFeed({
  siteUrl,
  products,
  title = SITE_NAME,
  description = SITE_DESCRIPTION,
}: {
  siteUrl: string;
  products: Product[];
  title?: string;
  description?: string;
}): string {
  const items = products
    .map((product) => toGoogleShoppingItem(product, siteUrl))
    .filter((item): item is GoogleShoppingItem => item !== null);

  const channel = [
    xmlElement("title", title),
    xmlElement("link", siteUrl),
    xmlElement("description", description),
    ...items.map(itemToXml),
  ].join("");

  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>${channel}</channel></rss>`;
}

export function catalogueUnavailableXml(): string {
  return '<?xml version="1.0" encoding="UTF-8"?><error>Catalogue unavailable</error>';
}

function itemToXml(item: GoogleShoppingItem): string {
  return `<item>${[
    xmlElement("g:id", item.id),
    xmlElement("g:title", item.title),
    xmlElement("g:description", item.description),
    xmlElement("g:link", item.link),
    xmlElement("g:image_link", item.imageLink),
    xmlElement("g:availability", item.availability),
    xmlElement("g:price", item.price),
    xmlElement("g:brand", item.brand),
    xmlElement("g:condition", item.condition),
    xmlElement("g:product_type", item.productType),
  ].join("")}</item>`;
}

export { escapeXml } from "@/lib/feeds/xml";
