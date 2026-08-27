import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FilterPanel } from "@/components/commerce/FilterPanel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { parseProductQuery } from "@/lib/commerce/url-state";
import { collectionMetadata } from "@/lib/seo";
import { parseAmount } from "@/lib/format";
import type { HandlePageProps } from "@/lib/page-props";

export async function generateStaticParams() {
  const collections = await getCatalogProvider().getCollections();
  return collections.map((collection) => ({ handle: collection.handle }));
}

export async function generateMetadata({ params }: HandlePageProps) {
  const { handle } = await params;
  const result = await getCatalogProvider().getCollection(handle);
  if (!result) {
    return { title: "Collection" };
  }
  return collectionMetadata(result.collection);
}

export default async function CollectionPage({
  params,
  searchParams,
}: HandlePageProps) {
  const { handle } = await params;
  const query = parseProductQuery(await searchParams);
  const result = await getCatalogProvider().getCollection(handle, query);

  if (!result) {
    notFound();
  }

  const { collection, products, facets } = result;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/collections/all", label: "Shop" },
          { label: collection.title },
        ]}
      />
      <header className="mt-8 max-w-2xl">
        <h1 className="font-display text-4xl md:text-5xl">{collection.title}</h1>
        {collection.description ? (
          <p className="mt-4 text-muted">{collection.description}</p>
        ) : null}
        <p className="mt-3 text-sm text-muted">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
      </header>
      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside>
          <details className="lg:hidden">
            <summary className="cursor-pointer text-sm tracking-[0.12em] uppercase">
              Filter and sort
            </summary>
            <div className="pt-6">
              <Suspense>
                <FilterPanel facets={facets} idPrefix="mobile" />
              </Suspense>
            </div>
          </details>
          <div className="hidden lg:block">
            <Suspense>
              <FilterPanel facets={facets} />
            </Suspense>
          </div>
        </aside>
        <div>
          {products.length === 0 ? (
            <EmptyState
              title="Nothing matches these filters"
              description="Clear a filter or browse the full collection."
              action={{ href: `/collections/${handle}`, label: "Reset filters" }}
            />
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
      <AnalyticsListener
        event={{
          name: "view_item_list",
          items: products.slice(0, 8).map((product) => ({
            item_id: product.handle,
            item_name: product.title,
            item_brand: product.vendor,
            item_category: product.category,
            price: parseAmount(product.priceRange.minVariantPrice),
          })),
        }}
      />
    </div>
  );
}
