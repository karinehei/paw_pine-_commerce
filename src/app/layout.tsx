import { Fraunces, Outfit } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getCommerceMode, getGtmId } from "@/lib/env";
import { siteMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import { htmlLang, openGraphLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/path";
import { getSiteUrl } from "@/lib/env-public";
import type { RootLayoutProps } from "@/lib/page-props";
import type { Metadata } from "next";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getMessages(locale);
  const siteUrl = getSiteUrl();
  const canonical = withLocale("/", locale);
  return siteMetadata({
    description: t.description,
    title: {
      default: `Paw & Pine — ${t.tagline}`,
      template: `%s — Paw & Pine`,
    },
    openGraph: {
      type: "website",
      locale: openGraphLocale(locale),
      siteName: "Paw & Pine",
      title: "Paw & Pine",
      description: t.description,
      url: siteUrl,
    },
    alternates: {
      canonical,
      languages: {
        en: "/",
        fi: "/fi",
        "x-default": "/",
      },
    },
  });
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const mode = getCommerceMode();
  const gtmId = getGtmId();
  const locale = await getLocale();
  const t = getMessages(locale);

  return (
    <html
      lang={htmlLang(locale)}
      className={`${outfit.variable} ${fraunces.variable} h-full`}
    >
      <body className="bg-linen text-ink flex min-h-full flex-col font-sans antialiased">
        <LocaleProvider locale={locale}>
          <JsonLd data={organizationJsonLd()} />
          <JsonLd data={websiteJsonLd()} />
          <AnalyticsScripts gtmId={gtmId} />
          <PageViewTracker />
          <a
            href="#main"
            className="focus:bg-paper sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2"
          >
            {t.skipToContent}
          </a>
          <CartProvider mode={mode}>
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer mode={mode} />
            <CartDrawer />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
