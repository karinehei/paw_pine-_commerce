import Image from "next/image";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductMedia } from "@/components/product/ProductMedia";
import { NewsletterForm } from "@/components/commerce/NewsletterForm";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { filterByCollection } from "@/lib/commerce/filters";
import { itemFromProduct } from "@/lib/analytics/items";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";

export default async function HomePage() {
  const t = getMessages(await getLocale());
  const all = await getCatalogProvider().getProducts();
  const bestsellers = filterByCollection(all.products, "best-sellers") ?? [];
  const newest = filterByCollection(all.products, "new-arrivals") ?? [];
  const featured = (bestsellers.length > 0 ? bestsellers : all.products).slice(0, 4);
  const newItems = (newest.length > 0 ? newest : all.products).slice(0, 4);

  const categories = [
    { href: "/collections/toys", title: t.toys },
    { href: "/collections/beds", title: t.beds },
    { href: "/collections/feeding", title: t.feeding },
    { href: "/collections/harnesses", title: t.walking },
    { href: "/collections/scratching", title: t.scratching },
  ];

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-end gap-10 px-4 py-12 sm:py-16 md:grid-cols-2 md:px-6 md:py-20">
        <div>
          <p className="text-label text-muted">{t.homeKicker}</p>
          <h1 className="font-display text-display mt-4 text-balance">
            {t.homeHeadline}
          </h1>
          <p className="text-muted mt-6 max-w-md text-lg">{t.homeSupporting}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LocaleLink href="/collections/dogs" className="btn-primary">
              {t.shopDogs}
            </LocaleLink>
            <LocaleLink href="/collections/cats" className="btn-secondary">
              {t.shopCats}
            </LocaleLink>
          </div>
          <p className="text-muted mt-8 max-w-sm text-sm">{t.homeEditorial}</p>
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
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="font-display text-h2">{t.shopByPet}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
            <ShopPetCard
              href="/collections/dogs"
              title={t.dogs}
              src="/images/editorial-dogs.jpg"
              alt={t.shopByPetDogsAlt}
            />
            <ShopPetCard
              href="/collections/cats"
              title={t.cats}
              src="/images/editorial-cats.jpg"
              alt={t.shopByPetCatsAlt}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading
          title={t.bestSellers}
          href="/collections/best-sellers"
          viewAll={t.viewAll}
        />
        <ProductGrid
          products={featured}
          listId="home-best-sellers"
          listName={t.bestSellers}
          priorityCount={2}
          density="editorial"
        />
      </section>

      <section className="border-border border-y">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="font-display text-h2">{t.shop}</h2>
          <ul className="bg-border mt-8 grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((item) => (
              <li key={item.href} className="bg-linen">
                <LocaleLink
                  href={item.href}
                  className="hover:bg-paper flex min-h-24 items-center justify-center px-4 py-6 text-center text-sm tracking-[0.12em] uppercase"
                >
                  {item.title}
                </LocaleLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading
          title={t.newArrivals}
          href="/collections/new-arrivals"
          viewAll={t.viewAll}
        />
        <ProductGrid
          products={newItems}
          listId="home-new"
          listName={t.newArrivals}
          density="editorial"
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
              {t.about}
            </LocaleLink>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-6">
        <div>
          <p className="text-label text-muted">{t.homeStudioKicker}</p>
          <h2 className="font-display mt-3 text-4xl">{t.homeStudioTitle}</h2>
          <p className="text-muted mt-4 max-w-md">{t.homeStudioCopy}</p>
        </div>
        <div className="bg-paper p-8 md:p-12">
          <h2 className="font-display text-3xl">{t.joinTheList}</h2>
          <p className="text-muted mt-3 text-sm">{t.newsletterBlurb}</p>
          <div className="mt-6">
            <NewsletterForm id="home-newsletter-email" />
          </div>
        </div>
      </section>
      <AnalyticsListener
        event={{
          name: "view_item_list",
          item_list_id: "home-best-sellers",
          item_list_name: t.bestSellers,
          items: featured.map((product) => itemFromProduct(product)),
        }}
      />
    </>
  );
}

function ShopPetCard({
  href,
  title,
  src,
  alt,
}: {
  href: string;
  title: string;
  src: string;
  alt: string;
}) {
  return (
    <LocaleLink
      href={href}
      className="bg-stone relative block aspect-[5/4] overflow-hidden"
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(min-width: 768px) 50vw, 100vw"
      />
      <span className="bg-linen/90 absolute inset-x-0 bottom-0 px-5 py-4">
        <span className="font-display text-2xl md:text-3xl">{title}</span>
      </span>
    </LocaleLink>
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
