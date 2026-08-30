import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductMedia } from "@/components/product/ProductMedia";
import { NewsletterForm } from "@/components/commerce/NewsletterForm";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { itemFromProduct } from "@/lib/analytics/items";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";

export default async function HomePage() {
  const t = getMessages(await getLocale());
  const commerce = getCatalogProvider();
  const [all, bestsellers, newest] = await Promise.all([
    commerce.getProducts(),
    commerce.getCollection("best-sellers"),
    commerce.getCollection("new-arrivals"),
  ]);

  const featured = all.products.slice(0, 4);
  const categories = [
    { href: "/collections/dogs", kicker: "01", title: t.dogs, copy: t.catDogsCopy },
    { href: "/collections/cats", kicker: "02", title: t.cats, copy: t.catCatsCopy },
    { href: "/collections/beds", kicker: "03", title: t.beds, copy: t.catBedsCopy },
    {
      href: "/collections/feeding",
      kicker: "04",
      title: t.feeding,
      copy: t.catFeedingCopy,
    },
  ];

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-end gap-10 px-4 py-12 sm:py-16 md:grid-cols-2 md:px-6 md:py-24">
        <div>
          <p className="text-muted text-xs tracking-[0.2em] uppercase">{t.homeKicker}</p>
          <h1 className="font-display mt-4 text-4xl leading-[1.08] text-balance sm:text-5xl md:text-6xl">
            {t.homeHeadline}
          </h1>
          <p className="text-muted mt-6 max-w-md text-lg">{t.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LocaleLink href="/collections/dogs" className="btn-primary">
              {t.shopDogs}
            </LocaleLink>
            <LocaleLink href="/collections/cats" className="btn-secondary">
              {t.shopCats}
            </LocaleLink>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featured.slice(0, 2).map((product) => (
            <LocaleLink
              key={product.id}
              href={`/products/${product.handle}`}
              className="bg-stone block aspect-[4/5] overflow-hidden"
            >
              <ProductMedia product={product} image={product.featuredImage} priority />
            </LocaleLink>
          ))}
        </div>
      </section>

      <section className="border-border bg-paper border-y">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-4 md:px-6">
          {categories.map((item) => (
            <LocaleLink key={item.href} href={item.href} className="group">
              <p className="text-muted text-xs tracking-[0.16em] uppercase">
                {item.kicker}
              </p>
              <h2 className="font-display group-hover:text-pine mt-2 text-3xl">
                {item.title}
              </h2>
              <p className="text-muted mt-2 text-sm">{item.copy}</p>
            </LocaleLink>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <SectionHeading
          title={t.bestSellers}
          href="/collections/best-sellers"
          viewAll={t.viewAll}
        />
        <ProductGrid
          products={(bestsellers?.products ?? featured).slice(0, 4)}
          listId="home-best-sellers"
          listName={t.bestSellers}
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <SectionHeading
          title={t.homeNew}
          href="/collections/new-arrivals"
          viewAll={t.viewAll}
        />
        <ProductGrid
          products={(newest?.products ?? all.products).slice(0, 4)}
          listId="home-new"
          listName={t.newArrivals}
        />
      </section>

      <section className="bg-pine text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-6">
          <h2 className="font-display text-4xl text-balance">{t.homeMaterialsTitle}</h2>
          <div className="text-paper/80 space-y-4">
            <p>{t.homeMaterialsP1}</p>
            <p>{t.homeMaterialsP2}</p>
            <LocaleLink
              href="/about"
              className="inline-block pt-2 text-sm tracking-[0.14em] uppercase underline-offset-4 hover:underline"
            >
              {t.theHouse}
            </LocaleLink>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-6">
        <div>
          <p className="text-muted text-xs tracking-[0.16em] uppercase">
            {t.homeStudioKicker}
          </p>
          <h2 className="font-display mt-3 text-4xl">{t.homeStudioTitle}</h2>
          <p className="text-muted mt-4 max-w-md">{t.homeStudioCopy}</p>
        </div>
        <div className="bg-paper p-8 md:p-12">
          <h2 className="font-display text-3xl">{t.joinTheList}</h2>
          <p className="text-muted mt-3 text-sm">{t.newsletterBlurb}</p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </section>
      <AnalyticsListener
        event={{
          name: "view_item_list",
          item_list_id: "home-best-sellers",
          item_list_name: t.bestSellers,
          items: (bestsellers?.products ?? featured)
            .slice(0, 4)
            .map((product) => itemFromProduct(product)),
        }}
      />
    </>
  );
}

function SectionHeading({
  title,
  href,
  viewAll,
}: {
  title: string;
  href: string;
  viewAll: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <h2 className="font-display text-3xl">{title}</h2>
      <LocaleLink
        href={href}
        className="text-muted text-sm underline-offset-4 hover:underline"
      >
        {viewAll}
      </LocaleLink>
    </div>
  );
}
