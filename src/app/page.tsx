import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductMedia } from "@/components/product/ProductMedia";
import { NewsletterForm } from "@/components/commerce/NewsletterForm";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { itemFromProduct } from "@/lib/analytics/items";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export default async function HomePage() {
  const commerce = getCatalogProvider();
  const [all, bestsellers, newest] = await Promise.all([
    commerce.getProducts(),
    commerce.getCollection("best-sellers"),
    commerce.getCollection("new-arrivals"),
  ]);

  const featured = all.products.slice(0, 4);

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-end gap-10 px-4 py-12 sm:py-16 md:grid-cols-2 md:px-6 md:py-24">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted uppercase">Oslo / the house</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.08] text-balance sm:text-5xl md:text-6xl">
            Quiet objects for dogs and cats.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">{SITE_TAGLINE}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/collections/dogs"
              className="btn-primary"
            >
              Shop dogs
            </Link>
            <Link
              href="/collections/cats"
              className="btn-secondary"
            >
              Shop cats
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featured.slice(0, 2).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              className="block aspect-[4/5] overflow-hidden bg-stone"
            >
              <ProductMedia product={product} image={product.featuredImage} priority />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-paper">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-4 md:px-6">
          {CATEGORIES.map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <p className="text-xs tracking-[0.16em] text-muted uppercase">{item.kicker}</p>
              <h2 className="mt-2 font-display text-3xl group-hover:text-pine">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">{item.copy}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <SectionHeading title="Best sellers" href="/collections/best-sellers" />
        <ProductGrid
          products={(bestsellers?.products ?? featured).slice(0, 4)}
          listId="home-best-sellers"
          listName="Best sellers"
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <SectionHeading title="New in the house" href="/collections/new-arrivals" />
        <ProductGrid
          products={(newest?.products ?? all.products).slice(0, 4)}
          listId="home-new"
          listName="New arrivals"
        />
      </section>

      <section className="bg-pine text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-6">
          <h2 className="font-display text-4xl text-balance">
            Materials with a longer life than the trend cycle.
          </h2>
          <div className="space-y-4 text-paper/80">
            <p>
              {SITE_NAME} is edited like a small room: oak, wool, stoneware, and linen. If an object
              cannot sit beside the rest of the furniture, it does not belong here.
            </p>
            <p>
              We work with small makers. We do not add a mascot to a plastic mould and call it
              considered.
            </p>
            <Link
              href="/about"
              className="inline-block pt-2 text-sm tracking-[0.14em] uppercase underline-offset-4 hover:underline"
            >
              The house
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-6">
        <div>
          <p className="text-xs tracking-[0.16em] text-muted uppercase">From the studio</p>
          <h2 className="mt-3 font-display text-4xl">A windowsill, not a playroom.</h2>
          <p className="mt-4 max-w-md text-muted">
            The window perch was drawn for a rented kitchen in Grünerløkka: no drilling, a linen
            seat, and a clamp that does not mark the paint. It is the piece we still make first.
          </p>
        </div>
        <div className="bg-paper p-8 md:p-12">
          <h2 className="font-display text-3xl">Join the list</h2>
          <p className="mt-3 text-sm text-muted">
            Restocks, a new maker, occasionally a note on materials. No weekly noise.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </section>
      <AnalyticsListener
        event={{
          name: "view_item_list",
          item_list_id: "home-best-sellers",
          item_list_name: "Best sellers",
          items: (bestsellers?.products ?? featured).slice(0, 4).map((product) =>
            itemFromProduct(product),
          ),
        }}
      />
    </>
  );
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <h2 className="font-display text-3xl">{title}</h2>
      <Link href={href} className="text-sm text-muted underline-offset-4 hover:underline">
        View all
      </Link>
    </div>
  );
}

const CATEGORIES = [
  {
    href: "/collections/dogs",
    kicker: "01",
    title: "Dogs",
    copy: "Walk, rest, and feeding — cut for daily use.",
  },
  {
    href: "/collections/cats",
    kicker: "02",
    title: "Cats",
    copy: "Scratching and perches that can live in the room.",
  },
  {
    href: "/collections/beds",
    kicker: "03",
    title: "Beds",
    copy: "Wool nests, oak frames, a window seat.",
  },
  {
    href: "/collections/feeding",
    kicker: "04",
    title: "Feeding",
    copy: "Stoneware and ceramic, closer to the kitchen.",
  },
];
