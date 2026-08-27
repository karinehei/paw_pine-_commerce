import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductGrid } from "@/components/product/ProductGrid";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { breadcrumbJsonLd, productJsonLd, productMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/env";
import { itemFromProduct } from "@/lib/analytics/items";
import { parseAmount } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import type { HandlePageProps } from "@/lib/page-props";

export async function generateStaticParams() {
  const { products } = await getCatalogProvider().getProducts();
  return products.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: HandlePageProps) {
  const { handle } = await params;
  const product = await getCatalogProvider().getProduct(handle);
  if (!product) {
    return { title: "Product" };
  }
  return productMetadata(product);
}

export default async function ProductPage({ params }: HandlePageProps) {
  const { handle } = await params;
  const commerce = getCatalogProvider();
  const product = await commerce.getProduct(handle);

  if (!product) {
    notFound();
  }

  const recommended = await commerce.getRecommendations(handle);
  const url = `${getSiteUrl()}/products/${product.handle}`;
  const speciesHref = `/collections/${product.species === "dog" ? "dogs" : "cats"}`;
  const speciesLabel = product.species === "dog" ? "Dogs" : "Cats";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <JsonLd data={productJsonLd(product, url)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: getSiteUrl() },
          { name: speciesLabel, url: `${getSiteUrl()}${speciesHref}` },
          { name: product.title, url },
        ])}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: speciesHref, label: speciesLabel },
          { label: product.title },
        ]}
      />
      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <ProductGallery product={product} />
        <div>
          <p className="text-xs tracking-[0.16em] text-muted uppercase">{product.vendor}</p>
          <h1 className="mt-2 font-display text-[2.25rem] leading-[1.1] md:text-5xl">{product.title}</h1>
          <div className="mt-6 max-w-lg space-y-3 text-muted">
            {product.description
              .split(/\n\n+/)
              .map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
          </div>
          <div className="mt-8">
            <ProductPurchase product={product} />
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {product.features.slice(0, 3).map((feature) => (
              <li key={feature} className="border border-border bg-paper px-4 py-3 text-sm">
                {feature}
              </li>
            ))}
          </ul>
          <dl className="mt-10 space-y-4 border-t border-border pt-8 text-sm">
            <div>
              <dt className="tracking-[0.14em] text-muted uppercase">Materials</dt>
              <dd className="mt-1">{product.material}</dd>
            </div>
            <div>
              <dt className="tracking-[0.14em] text-muted uppercase">Dimensions</dt>
              <dd className="mt-1">{product.dimensions}</dd>
            </div>
            <div>
              <dt className="tracking-[0.14em] text-muted uppercase">Care</dt>
              <dd className="mt-1">{product.care}</dd>
            </div>
            <div>
              <dt className="tracking-[0.14em] text-muted uppercase">Shipping and returns</dt>
              <dd className="mt-1 text-muted">
                Complimentary shipping over €{FREE_SHIPPING_THRESHOLD}. Unused items may be returned
                within 30 days. See{" "}
                <Link href="/shipping" className="underline-offset-4 hover:underline">
                  shipping
                </Link>{" "}
                and{" "}
                <Link href="/returns" className="underline-offset-4 hover:underline">
                  returns
                </Link>
                .
              </dd>
            </div>
          </dl>
        </div>
      </div>
      {recommended.length > 0 ? (
        <section className="mt-20">
          <h2 className="mb-8 font-display text-3xl">You may also like</h2>
          <ProductGrid
            products={recommended}
            listId="related"
            listName="Related products"
          />
        </section>
      ) : null}
      <RecentlyViewed
        current={{ handle: product.handle, title: product.title, vendor: product.vendor }}
      />
      <AnalyticsListener
        event={{
          name: "view_item",
          currency: product.priceRange.minVariantPrice.currencyCode,
          value: parseAmount(product.priceRange.minVariantPrice),
          items: [itemFromProduct(product)],
        }}
      />
    </div>
  );
}
