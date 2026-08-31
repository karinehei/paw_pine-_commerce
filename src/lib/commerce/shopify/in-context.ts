import { SHOPIFY_COUNTRY, shopifyLanguage, type Locale } from "@/lib/i18n/config";

/**
 * Storefront contextual pricing and translated resources.
 * Country is always FI (Finnish market). Language follows the URL locale.
 */
export function withStorefrontInContext(document: string): string {
  if (document.includes("@inContext")) {
    return document;
  }

  const withArgs = document.replace(
    /\b(query|mutation)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g,
    (_all, kind: string, name: string, args: string) => {
      const trimmed = args.trim().replace(/,\s*$/, "");
      const nextArgs = trimmed
        ? `${trimmed}, $country: CountryCode, $language: LanguageCode`
        : `$country: CountryCode, $language: LanguageCode`;
      return `${kind} ${name}(${nextArgs}) @inContext(country: $country, language: $language)`;
    },
  );

  return withArgs.replace(
    /\b(query|mutation)\s+([A-Za-z0-9_]+)\s*\{/g,
    (_all, kind: string, name: string) =>
      `${kind} ${name}($country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {`,
  );
}

export function storefrontContextVariables(locale: Locale): {
  country: "FI";
  language: "FI" | "EN" | "SV";
} {
  return {
    country: SHOPIFY_COUNTRY[locale],
    language: shopifyLanguage(locale),
  };
}
