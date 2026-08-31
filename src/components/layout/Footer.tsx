import { Suspense } from "react";
import { NewsletterForm } from "@/components/commerce/NewsletterForm";
import { CookiePreferencesButton } from "@/components/consent/CookiePreferencesButton";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { SITE_NAME } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";

export async function Footer() {
  const t = getMessages(await getLocale());
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
  const about = [{ href: "/about", label: t.about }];

  return (
    <footer className="border-border bg-paper mt-auto border-t">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-4 md:px-6">
        <div>
          <p className="font-display text-2xl">{SITE_NAME}</p>
          <p className="text-muted mt-3 max-w-xs text-sm">{t.homeEditorial}</p>
        </div>
        <FooterColumn title={t.shop} links={shop} />
        <FooterColumn title={t.customerService} links={help} />
        <div>
          <p className="text-label text-muted">{t.information}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {about.map((link) => (
              <li key={link.href}>
                <LocaleLink href={link.href} className="hover:text-pine">
                  {link.label}
                </LocaleLink>
              </li>
            ))}
            <li>
              <CookiePreferencesButton label={t.cookiePreferences} />
            </li>
          </ul>
          <div className="mt-8">
            <NewsletterForm id="footer-newsletter-email" />
          </div>
        </div>
      </div>
      <div className="border-border border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6">
          <p className="text-muted text-xs">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Suspense fallback={null}>
              <LanguageSwitcher />
            </Suspense>
            <LocaleLink
              href="/case-study"
              className="text-muted text-xs underline-offset-4 hover:underline"
            >
              {t.caseStudy}
            </LocaleLink>
          </div>
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
      <p className="text-label text-muted">{title}</p>
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
