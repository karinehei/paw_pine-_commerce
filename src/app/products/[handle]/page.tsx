import { notFound, unstable_rethrow } from "next/navigation";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductGrid } from "@/components/product/ProductGrid";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { JsonLd } from "@/components/seo/JsonLd";
import { ErrorState } from "@/components/ui/ErrorState";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { breadcrumbJsonLd, productJsonLd, productMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/env";
import { itemFromProduct } from "@/lib/analytics/items";
import { parseAmount } from "@/lib/format";
import { withLocale } from "@/lib/i18n/path";
import type { HandlePageProps } from "@/lib/page-props";

/**
 * Locale and Shopify context read `headers()` / `cookies()`.
 * `generateStaticParams` would prerender these routes as static, then Next.js
 * throws at runtime: "Page changed from static to dynamic ... reason: headers".
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: HandlePageProps) {
  const { handle } = await params;
  const locale = await getLocale();
  try {
    const product = await getCatalogProvider().getProduct(handle);
    if (!product) {
      return { title: getMessages(locale).productFallback };
    }
    return productMetadata(product, locale);
  } catch (error) {
    unstable_rethrow(error);
    return { title: getMessages(locale).productFallback };
  }
}

export default async function ProductPage({ params }: HandlePageProps) {
  const { handle } = await params;
  const commerce = getCatalogProvider();
  let product;
  let recommended;
  try {
    [product, recommended] = await Promise.all([
      commerce.getProduct(handle),
      commerce.getRecommendations(handle),
    ]);
  } catch (error) {
    unstable_rethrow(error);
    return (
      <div className="px-4">
        <ErrorState />
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const t = getMessages(await getLocale());
  const locale = await getLocale();
  const url = `${getSiteUrl()}${withLocale(`/products/${product.handle}`, locale)}`;
  const speciesHref = `/collections/${product.species === "dog" ? "dogs" : "cats"}`;
  const speciesLabel = product.species === "dog" ? t.dogs : t.cats;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <JsonLd data={productJsonLd(product, url)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.home, url: `${getSiteUrl()}${withLocale("/", locale)}` },
          {
            name: speciesLabel,
            url: `${getSiteUrl()}${withLocale(speciesHref, locale)}`,
          },
          { name: product.title, url },
        ])}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: t.home },
          { href: speciesHref, label: speciesLabel },
          { label: product.title },
        ]}
      />
      <div className="mt-8 grid items-start gap-12 lg:grid-cols-2">
        <ProductGallery product={product} />
        <div className="lg:sticky lg:top-28">
          <p className="text-label text-muted">{product.vendor}</p>
          <h1 className="font-display mt-2 text-[2.25rem] leading-[1.1] md:text-5xl">
            {product.title}
          </h1>
          <p className="text-muted mt-4 max-w-lg">
            {(product.description ?? "").split(/\n\n+/)[0] || product.title}
          </p>
          <div className="mt-8">
            <ProductPurchase product={product} />
          </div>
          <div className="mt-4">
            <WishlistButton product={product} />
          </div>
          <ul className="text-muted mt-8 space-y-2 text-sm">
            {product.availableForSale ? <li>✓ {t.trustInStock}</li> : null}
            <li>✓ {t.trustFreeShipping}</li>
            <li>✓ {t.trustReturns}</li>
          </ul>
          <ProductDetails product={product} />
        </div>
      </div>
      {recommended.length > 0 ? (
        <section className="mt-20">
          <h2 className="font-display mb-8 text-3xl">{t.youMayAlsoLike}</h2>
          <ProductGrid
            products={recommended}
            listId="related"
            listName={t.youMayAlsoLike}
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
