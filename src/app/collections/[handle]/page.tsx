import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FilterPanel } from "@/components/commerce/FilterPanel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { parseProductQuery } from "@/lib/commerce/url-state";
import { breadcrumbJsonLd, collectionJsonLd, collectionMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/env";
import { itemFromProduct } from "@/lib/analytics/items";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import type { HandlePageProps } from "@/lib/page-props";

export async function generateStaticParams() {
  const collections = await getCatalogProvider().getCollections();
  return collections.map((collection) => ({ handle: collection.handle }));
}

export async function generateMetadata({ params }: HandlePageProps) {
  const { handle } = await params;
  const result = await getCatalogProvider().getCollection(handle);
  if (!result) {
    return { title: getMessages(await getLocale()).collectionFallback };
  }
  return collectionMetadata(result.collection);
}

export default async function CollectionPage({ params, searchParams }: HandlePageProps) {
  const { handle } = await params;
  const t = getMessages(await getLocale());
  const query = parseProductQuery(await searchParams);
  const result = await getCatalogProvider().getCollection(handle, query);

  if (!result) {
    notFound();
  }

  const { collection, products, facets } = result;
  const url = `${getSiteUrl()}/collections/${collection.handle}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <JsonLd data={collectionJsonLd(collection, products, url)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.home, url: getSiteUrl() },
          { name: t.shop, url: `${getSiteUrl()}/collections/all` },
          { name: collection.title, url },
        ])}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: t.home },
          { href: "/collections/all", label: t.shop },
          { label: collection.title },
        ]}
      />
      <header className="mt-8 max-w-2xl">
        <h1 className="font-display text-4xl md:text-5xl">{collection.title}</h1>
        {collection.description ? (
          <p className="text-muted mt-4">{collection.description}</p>
        ) : null}
        <p className="text-muted mt-3 text-sm">{t.pieces(products.length)}</p>
      </header>
      <div className="mt-10 grid gap-10 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside>
          <details className="md:hidden">
            <summary className="min-h-11 cursor-pointer text-sm tracking-[0.12em] uppercase">
              {t.filterAndSort}
            </summary>
            <div className="pt-6">
              <Suspense>
                <FilterPanel facets={facets} idPrefix="mobile" />
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
            <EmptyState
              title={t.emptyFiltersTitle}
              description={t.emptyFiltersDescription}
              action={{ href: `/collections/${handle}`, label: t.resetFilters }}
            />
          ) : (
            <ProductGrid
              products={products}
              listId={collection.handle}
              listName={collection.title}
            />
          )}
        </div>
      </div>
      <AnalyticsListener
        event={{
          name: "view_item_list",
          item_list_id: collection.handle,
          item_list_name: collection.title,
          items: products.slice(0, 8).map((product) => itemFromProduct(product)),
        }}
      />
    </div>
  );
}
