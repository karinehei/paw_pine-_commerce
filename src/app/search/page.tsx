import { Suspense } from "react";
import { FilterPanel } from "@/components/commerce/FilterPanel";
import { SearchBox } from "@/components/commerce/SearchBox";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { parseProductQuery } from "@/lib/commerce/url-state";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import { searchMetadata } from "@/lib/seo";
import type { QueryPageProps } from "@/lib/page-props";

export async function generateMetadata({ searchParams }: QueryPageProps) {
  const query = parseProductQuery(await searchParams);
  return searchMetadata(query.query, await getLocale());
}

export default async function SearchPage({ searchParams }: QueryPageProps) {
  const query = parseProductQuery(await searchParams);
  const t = getMessages(await getLocale());
  const term = query.query ?? "";
  const { products, facets } = term
    ? await getCatalogProvider().searchProducts(term, query)
    : await getCatalogProvider().getProducts(query);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-display text-4xl">{t.searchHeading}</h1>
      <div className="mt-6 max-w-xl">
        <SearchBox defaultValue={term} id="search-page" updateUrlOnIdle />
      </div>
      {term ? (
        <p className="text-muted mt-4 text-sm">{t.searchResult(products.length, term)}</p>
      ) : (
        <p className="text-muted mt-4 text-sm">{t.searchEmptyHint}</p>
      )}
      <div className="mt-10 grid gap-10 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside>
          <details className="md:hidden">
            <summary className="min-h-11 cursor-pointer text-sm tracking-[0.12em] uppercase">
              {t.filterAndSort}
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
                title={t.searchEmptyTitle}
                description={t.searchEmptyDescription}
              />
              <ul className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
                <li>
                  <LocaleLink
                    href="/collections/dogs"
                    className="underline-offset-4 hover:underline"
                  >
                    {t.dogs}
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink
                    href="/collections/cats"
                    className="underline-offset-4 hover:underline"
                  >
                    {t.cats}
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink
                    href="/collections/beds"
                    className="underline-offset-4 hover:underline"
                  >
                    {t.beds}
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink
                    href="/collections/all"
                    className="underline-offset-4 hover:underline"
                  >
                    {t.allProducts}
                  </LocaleLink>
                </li>
              </ul>
            </div>
          ) : (
            <ProductGrid products={products} listId="search" listName={t.searchHeading} />
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
