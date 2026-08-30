export const HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;
export const SHOPIFY_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;
export const SHOPIFY_API_VERSION_PATTERN = /^\d{4}-\d{2}$/;
export const SHOPIFY_CART_GID_PREFIX = "gid://shopify/Cart/";
export const MAX_SEARCH_QUERY_LENGTH = 80;
export const MAX_FILTER_VALUE_LENGTH = 40;
export const MAX_LINE_QUANTITY = 99;

export function isProductHandle(value: string): boolean {
  return value.length > 0 && value.length <= 100 && HANDLE_PATTERN.test(value);
}

export function isGtmId(value: string): boolean {
  return GTM_ID_PATTERN.test(value.trim());
}

export function isShopifyStoreDomain(value: string): boolean {
  return SHOPIFY_DOMAIN_PATTERN.test(value);
}

export function isShopifyApiVersion(value: string): boolean {
  return SHOPIFY_API_VERSION_PATTERN.test(value);
}

export function isShopifyCartGid(value: string): boolean {
  return (
    value.startsWith(SHOPIFY_CART_GID_PREFIX) &&
    value.length <= 512 &&
    !/[\s<>"']/.test(value)
  );
}

export function normaliseShopifyDomain(raw: string): string | null {
  try {
    const host = raw.includes("://")
      ? new URL(raw).host
      : raw.split("/")[0]?.split(":")[0];
    if (!host) {
      return null;
    }
    const normalised = host.trim().toLowerCase();
    return isShopifyStoreDomain(normalised) ? normalised : null;
  } catch {
    return null;
  }
}

export function isShopifyCheckoutUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      return false;
    }
    const host = url.hostname.toLowerCase();
    return (
      host.endsWith(".myshopify.com") ||
      host === "checkout.shopify.com" ||
      host.endsWith(".shopify.com")
    );
  } catch {
    return false;
  }
}

export function clampSearchQuery(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.slice(0, MAX_SEARCH_QUERY_LENGTH);
}

/** Quote a term for Shopify's product search syntax so operators cannot be injected. */
export function quoteShopifySearchTerm(value: string): string {
  const cleaned = value
    .replace(/["\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_FILTER_VALUE_LENGTH);
  if (!cleaned) {
    return '""';
  }
  return `"${cleaned}"`;
}

export function sanitiseFilterValue(value: string): string | undefined {
  const cleaned = value
    .replace(/[^\p{L}\p{N} \-_.]/gu, "")
    .trim()
    .slice(0, MAX_FILTER_VALUE_LENGTH);
  return cleaned || undefined;
}

export function clampQuantity(quantity: number, available?: number | null): number {
  const max =
    typeof available === "number" && available > 0
      ? Math.min(MAX_LINE_QUANTITY, available)
      : MAX_LINE_QUANTITY;
  if (!Number.isFinite(quantity)) {
    return 1;
  }
  return Math.min(max, Math.max(1, Math.floor(quantity)));
}
