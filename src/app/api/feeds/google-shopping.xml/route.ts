import { NextResponse } from "next/server";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { getSiteUrl } from "@/lib/env";
import {
  buildGoogleShoppingFeed,
  catalogueUnavailableXml,
} from "@/lib/feeds/google-shopping";

export const revalidate = 3600;

export async function GET() {
  try {
    const { products } = await getCatalogProvider().getProducts();
    const xml = buildGoogleShoppingFeed({
      siteUrl: getSiteUrl(),
      products,
    });
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(catalogueUnavailableXml(), {
      status: 503,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
