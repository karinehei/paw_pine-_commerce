import { Suspense } from "react";
import Link from "next/link";
import { FilterPanel } from "@/components/commerce/FilterPanel";
import { SearchBox } from "@/components/commerce/SearchBox";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { parseProductQuery } from "@/lib/commerce/url-state";
import { searchMetadata } from "@/lib/seo";
import type { QueryPageProps } from "@/lib/page-props";

export async function generateMetadata({ searchParams }: QueryPageProps) {
  const query = parseProductQuery(await searchParams);
  return searchMetadata(query.query);
}

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
        <SearchBox defaultValue={term} id="search-page" updateUrlOnIdle />
      </div>
      {term ? (
        <p className="mt-4 text-sm text-muted">
          {products.length} {products.length === 1 ? "result" : "results"} for “{term}”
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted">Search by product, material, or maker.</p>
      )}
      <div className="mt-10 grid gap-10 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside>
          <details className="md:hidden">
            <summary className="min-h-11 cursor-pointer text-sm tracking-[0.12em] uppercase">
              Filter and sort
            </summary>
            <div className="pt-6">
              <Suspense>
                <FilterPanel facets={facets} idPrefix="search-mobile" />
              </Suspense>
            </div>
          </details>
          <div className="hidden md:block">
            <Suspense>
              <FilterPanel facets={facets} />
            </Suspense>
          </div>
        </aside>
        <div>
          {products.length === 0 ? (
            <div>
              <EmptyState
                title="No matching pieces"
                description="Try a broader word — wool, oak, harness, bowl — or start from a category."
              />
              <ul className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
                <li>
                  <Link href="/collections/dogs" className="underline-offset-4 hover:underline">
                    Dogs
                  </Link>
                </li>
                <li>
                  <Link href="/collections/cats" className="underline-offset-4 hover:underline">
                    Cats
                  </Link>
                </li>
                <li>
                  <Link href="/collections/beds" className="underline-offset-4 hover:underline">
                    Beds
                  </Link>
                </li>
                <li>
                  <Link href="/collections/all" className="underline-offset-4 hover:underline">
                    All products
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <ProductGrid products={products} listId="search" listName="Search results" />
          )}
        </div>
      </div>
      {term ? (
        <AnalyticsListener
          event={{ name: "search", search_term: term, results_count: products.length }}
        />
      ) : null}
    </div>
  );
}
