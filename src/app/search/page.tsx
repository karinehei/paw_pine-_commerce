import { Suspense } from "react";
import { FilterDrawer } from "@/components/commerce/FilterDrawer";
import { FilterPanel } from "@/components/commerce/FilterPanel";
import { SearchBox } from "@/components/commerce/SearchBox";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { filterByCollection } from "@/lib/commerce/filters";
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
  const locale = await getLocale();
  const t = getMessages(locale);
  const term = query.query ?? "";
  const commerce = getCatalogProvider();

  const { products, facets } = term
    ? await commerce.searchProducts(term, query)
    : {
        products: [],
        facets: {
          species: [],
          categories: [],
          brands: [],
          materials: [],
          priceMin: 0,
          priceMax: 0,
        },
      };

  const popular = !term
    ? (
        filterByCollection((await commerce.getProducts()).products, "best-sellers") ?? []
      ).slice(0, 6)
    : [];

  const suggestions = [
    { href: "/collections/toys", label: t.toys },
    { href: "/collections/beds", label: t.beds },
    { href: "/collections/harnesses", label: t.harnesses },
    { href: "/collections/feeding", label: t.feeding },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-display text-4xl">{t.searchHeading}</h1>
      <div className="mt-6 max-w-xl">
        <SearchBox defaultValue={term} id="search-page" updateUrlOnIdle />
      </div>
      {term ? (
        <p className="text-muted mt-4 text-sm">
          {products.length === 0
            ? t.searchNoResults(term)
            : t.searchResult(products.length, term)}
        </p>
      ) : (
        <p className="text-muted mt-4 text-sm">{t.searchEmptyHint}</p>
      )}

      {!term ? (
        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-label text-muted">{t.popularSearches}</h2>
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              {suggestions.map((item) => (
                <li key={item.href}>
                  <LocaleLink
                    href={item.href}
                    className="border-border inline-flex min-h-11 items-center border px-3 underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </section>
          {popular.length > 0 ? (
            <section>
              <h2 className="font-display text-2xl">{t.popularProducts}</h2>
              <div className="mt-6">
                <ProductGrid
                  products={popular}
                  listId="search-popular"
                  listName={t.popularProducts}
                  density="editorial"
                />
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <div className="mt-10 grid gap-10 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside>
            <FilterDrawer>
              <Suspense>
                <FilterPanel facets={facets} idPrefix="search-mobile" />
              </Suspense>
            </FilterDrawer>
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
                <p className="mt-6 text-center">
                  <LocaleLink
                    href="/search"
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    {t.clearQuery}
                  </LocaleLink>
                </p>
                <ul className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
                  {suggestions.map((item) => (
                    <li key={item.href}>
                      <LocaleLink
                        href={item.href}
                        className="underline-offset-4 hover:underline"
                      >
                        {item.label}
                      </LocaleLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ProductGrid
                products={products}
                listId="search"
                listName={t.searchHeading}
              />
            )}
          </div>
        </div>
      )}
      {term ? (
        <AnalyticsListener
          event={{ name: "search", search_term: term, results_count: products.length }}
        />
      ) : null}
    </div>
  );
}
