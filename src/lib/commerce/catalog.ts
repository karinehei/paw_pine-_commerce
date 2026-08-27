import "server-only";

import { demoCatalogApi } from "@/lib/commerce/demo/catalog-api";
import { shopifyProvider } from "@/lib/commerce/shopify/provider";
import { getCommerceMode } from "@/lib/env";

export function getCatalogProvider() {
  return getCommerceMode() === "shopify" ? shopifyProvider : demoCatalogApi;
}
