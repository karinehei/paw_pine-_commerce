import { NextResponse } from "next/server";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { buildSuggestions } from "@/lib/commerce/suggest";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2 || query.length > 80) {
    return NextResponse.json({ products: [], collections: [] });
  }

  const commerce = getCatalogProvider();
  const [{ products }, collections] = await Promise.all([
    commerce.getProducts(),
    commerce.getCollections(),
  ]);

  return NextResponse.json(buildSuggestions(query, products, collections), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
