import { NextResponse } from "next/server";
import {
  resolveShopifyConfig,
  storefrontEndpoint,
  storefrontRequestHeaders,
} from "@/lib/commerce/shopify/config";
import { logOpsEvent } from "@/lib/commerce/shopify/log";
import { SHOPIFY_HEALTH_QUERY } from "@/lib/commerce/shopify/queries";
import {
  healthFromShopifyStatus,
  httpStatusForHealth,
  probeShopifyStorefront,
  type ShopifyDependencyStatus,
} from "@/lib/ops/health";

export const dynamic = "force-dynamic";

function shopifyConfigOrInvalid() {
  try {
    return {
      ok: true as const,
      config: resolveShopifyConfig({
        SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
        SHOPIFY_STOREFRONT_PRIVATE_TOKEN: process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
        SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        SHOPIFY_STOREFRONT_API_VERSION: process.env.SHOPIFY_STOREFRONT_API_VERSION,
      }),
    };
  } catch {
    return { ok: false as const, config: null };
  }
}

export async function GET() {
  const resolved = shopifyConfigOrInvalid();
  let shopify: ShopifyDependencyStatus;

  if (!resolved.ok) {
    shopify = "error";
  } else if (!resolved.config) {
    shopify = "not_configured";
  } else {
    shopify = await probeShopifyStorefront({
      endpoint: storefrontEndpoint(resolved.config),
      headers: storefrontRequestHeaders(resolved.config),
      query: SHOPIFY_HEALTH_QUERY,
    });
  }

  const report = healthFromShopifyStatus(shopify);
  logOpsEvent("health", {
    status: report.status,
    shopify,
  });

  return NextResponse.json(report, {
    status: httpStatusForHealth(report),
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
