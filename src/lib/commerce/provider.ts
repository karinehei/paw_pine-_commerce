import "server-only";

import { demoProvider } from "@/lib/commerce/demo/provider";
import { shopifyProvider } from "@/lib/commerce/shopify/provider";
import { getCommerceMode } from "@/lib/env";
import type { CommerceProvider } from "@/lib/commerce/types";

export type { CommerceProvider } from "@/lib/commerce/types";
export { getCommerceMode, isShopifyMode } from "@/lib/env";

export function getCommerceProvider(): CommerceProvider {
  return getCommerceMode() === "shopify" ? shopifyProvider : demoProvider;
}
