import { Fraunces, Outfit } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { getCommerceMode, getGtmId } from "@/lib/env";
import { siteMetadata, organizationJsonLd, serializeJsonLd } from "@/lib/seo";
import type { RootLayoutProps } from "@/lib/page-props";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata = siteMetadata();

export default async function RootLayout({ children }: RootLayoutProps) {
  const mode = getCommerceMode();
  const gtmId = getGtmId();

  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-linen font-sans text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd()) }}
        />
        <AnalyticsScripts gtmId={gtmId} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <CartProvider mode={mode}>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer mode={mode} />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
