import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import {
  breadcrumbJsonLd,
  productJsonLd,
  productMetadata,
  serializeJsonLd,
} from "@/lib/seo";
import { getSiteUrl } from "@/lib/env";
import { parseAmount } from "@/lib/format";
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd(product, url)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            breadcrumbJsonLd([
              { name: "Home", url: getSiteUrl() },
              {
                name: product.species === "dog" ? "Dogs" : "Cats",
                url: `${getSiteUrl()}/collections/${product.species === "dog" ? "dogs" : "cats"}`,
              },
              { name: product.title, url },
            ]),
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          {
            href: `/collections/${product.species === "dog" ? "dogs" : "cats"}`,
            label: product.species === "dog" ? "Dogs" : "Cats",
          },
          { label: product.title },
        ]}
      />
      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <ProductGallery product={product} />
        <div>
          <p className="text-xs tracking-[0.16em] text-muted uppercase">{product.vendor}</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{product.title}</h1>
          <ProductPrice
            price={product.priceRange.minVariantPrice}
            compareAtPrice={product.compareAtPriceRange.minVariantPrice}
            className="mt-4 text-lg"
          />
          <p className="mt-6 max-w-lg text-muted">{product.description}</p>
          <div className="mt-8">
            <ProductPurchase product={product} />
          </div>
          <dl className="mt-10 space-y-4 border-t border-border pt-8 text-sm">
            <div>
              <dt className="tracking-[0.14em] text-muted uppercase">Materials</dt>
              <dd className="mt-1">{product.material}</dd>
            </div>
            <div>
              <dt className="tracking-[0.14em] text-muted uppercase">Details</dt>
              <dd className="mt-1">
                <ul className="list-disc space-y-1 pl-4">
                  {product.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="tracking-[0.14em] text-muted uppercase">Delivery</dt>
              <dd className="mt-1 text-muted">
                Dispatched in 2–4 working days. Complimentary shipping over €75. See{" "}
                <Link href="/shipping" className="underline-offset-4 hover:underline">
                  shipping
                </Link>{" "}
                for returns and lead times.
              </dd>
            </div>
          </dl>
        </div>
      </div>
      {recommended.length > 0 ? (
        <section className="mt-20">
          <h2 className="mb-8 font-display text-3xl">You may also like</h2>
          <ProductGrid products={recommended} />
        </section>
      ) : null}
      <AnalyticsListener
        event={{
          name: "view_item",
          currency: product.priceRange.minVariantPrice.currencyCode,
          value: parseAmount(product.priceRange.minVariantPrice),
          items: [
            {
              item_id: product.handle,
              item_name: product.title,
              item_brand: product.vendor,
              item_category: product.category,
              price: parseAmount(product.priceRange.minVariantPrice),
            },
          ],
        }}
      />
    </div>
  );
}
