import { Suspense } from "react";
import { FilterPanel } from "@/components/commerce/FilterPanel";
import { SearchInput } from "@/components/commerce/SearchInput";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { parseProductQuery } from "@/lib/commerce/url-state";
import type { QueryPageProps } from "@/lib/page-props";

export const metadata = {
  title: "Search",
  description: "Search the Paw & Pine edit.",
};

export default async function SearchPage({ searchParams }: QueryPageProps) {
  const query = parseProductQuery(await searchParams);
  const term = query.query ?? "";
  const { products, facets } = term
    ? await getCatalogProvider().searchProducts(term, query)
    : await getCatalogProvider().getProducts(query);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-display text-4xl">Search</h1>
      <div className="mt-6 max-w-xl">
        <SearchInput defaultValue={term} id="search-page" />
      </div>
      {term ? (
        <p className="mt-4 text-sm text-muted">
          {products.length} {products.length === 1 ? "result" : "results"} for “{term}”
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted">Search by product, material, or maker.</p>
      )}
      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside>
          <Suspense>
            <FilterPanel facets={facets} />
          </Suspense>
        </aside>
        <div>
          {products.length === 0 ? (
            <EmptyState
              title="No matching pieces"
              description="Try a broader word — wool, oak, harness, bowl — or browse the full edit."
              action={{ href: "/collections/all", label: "Browse all" }}
            />
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
      {term ? <AnalyticsListener event={{ name: "search", search_term: term }} /> : null}
    </div>
  );
}
