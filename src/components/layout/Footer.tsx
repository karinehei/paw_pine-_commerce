"use client";

import { NewsletterForm } from "@/components/commerce/NewsletterForm";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";
import { SITE_NAME } from "@/lib/constants";
import type { CommerceMode } from "@/lib/commerce/types";

export function Footer({ mode }: { mode: CommerceMode }) {
  const t = useMessages();
  const shop = [
    { href: "/collections/all", label: t.allProducts },
    { href: "/collections/dogs", label: t.dogs },
    { href: "/collections/cats", label: t.cats },
    { href: "/collections/new-arrivals", label: t.newArrivals },
  ];
  const help = [
    { href: "/shipping", label: t.shipping },
    { href: "/returns", label: t.returns },
    { href: "/contact", label: t.contact },
  ];
  const house = [
    { href: "/about", label: t.about },
    { href: "/search", label: t.search },
    { href: "/cart", label: t.bag },
    { href: "/demo/analytics", label: t.demoAnalytics },
  ];

  return (
    <footer className="border-border bg-paper mt-auto border-t">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-4 md:px-6">
        <div className="md:col-span-1">
          <p className="font-display text-2xl">{SITE_NAME}</p>
          <p className="text-muted mt-3 max-w-xs text-sm">{t.tagline}</p>
        </div>
        <FooterColumn title={t.shop} links={shop} />
        <FooterColumn title={t.help} links={help} />
        <div>
          <p className="text-muted text-xs tracking-[0.16em] uppercase">{t.houseNotes}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {house.map((link) => (
              <li key={link.href}>
                <LocaleLink href={link.href} className="hover:text-pine">
                  {link.label}
                </LocaleLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-border border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between md:px-6">
          <NewsletterForm />
          <p className="text-muted text-xs">
            {mode === "demo" ? t.demoCatalogue : t.liveCatalogue} ©{" "}
            {new Date().getFullYear()} {SITE_NAME}
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
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="text-muted text-xs tracking-[0.16em] uppercase">{title}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <LocaleLink href={link.href} className="hover:text-pine">
              {link.label}
            </LocaleLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
