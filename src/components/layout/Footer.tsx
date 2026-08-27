import Link from "next/link";
import { NewsletterForm } from "@/components/commerce/NewsletterForm";
import { FOOTER_LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import type { CommerceMode } from "@/lib/commerce/types";

export function Footer({ mode }: { mode: CommerceMode }) {
  return (
    <footer className="mt-auto border-t border-border bg-paper">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-4 md:px-6">
        <div className="md:col-span-1">
          <p className="font-display text-2xl">{SITE_NAME}</p>
          <p className="mt-3 max-w-xs text-sm text-muted">{SITE_TAGLINE}</p>
        </div>
        <FooterColumn title="Shop" links={FOOTER_LINKS.shop} />
        <FooterColumn title="Help" links={FOOTER_LINKS.help} />
        <div>
          <p className="text-xs tracking-[0.16em] text-muted uppercase">House notes</p>
          <ul className="mt-4 space-y-2 text-sm">
            {FOOTER_LINKS.house.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-pine">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between md:px-6">
          <NewsletterForm />
          <p className="text-xs text-muted">
            {mode === "demo"
              ? "Demo catalogue — connect Shopify to sell."
              : "Live catalogue via Shopify."}{" "}
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="text-xs tracking-[0.16em] text-muted uppercase">{title}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-pine">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
