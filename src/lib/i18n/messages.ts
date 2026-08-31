import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatMoney, moneyFromNumber } from "@/lib/format";
import { LOCALES, NUMBER_LOCALES, type Locale } from "@/lib/i18n/config";
import enJson from "../../../locales/en.json";
import fiJson from "../../../locales/fi.json";
import svJson from "../../../locales/sv.json";

export type Dictionary = typeof enJson;

const dictionaries: Record<Locale, Dictionary> = {
  en: enJson,
  fi: fiJson,
  sv: svJson,
};

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

function bind(dict: Dictionary, locale: Locale) {
  const threshold = formatMoney(
    moneyFromNumber(FREE_SHIPPING_THRESHOLD),
    NUMBER_LOCALES[locale],
  );
  return {
    ...dict,
    shippingBanner: interpolate(dict.shippingBanner, { threshold }),
    searchResult: (count: number, term: string) =>
      interpolate(count === 1 ? dict.searchResultOne : dict.searchResultMany, {
        count,
        term,
      }),
    openBag: (count: number) => interpolate(dict.openBag, { count }),
    pieces: (count: number) =>
      interpolate(count === 1 ? dict.piecesOne : dict.piecesMany, { count }),
    addedToBag: (title: string) => interpolate(dict.addedToBag, { title }),
    removedFromBag: (title: string) => interpolate(dict.removedFromBag, { title }),
    shippingAway: (amount: string) => interpolate(dict.shippingAway, { amount }),
    shippingFrom: (amount: string) => interpolate(dict.shippingFrom, { amount }),
    shippingEstimateDrawer: (amount: string) =>
      interpolate(dict.shippingEstimateDrawer, { amount }),
    shippingEstimatePage: (amount: string) =>
      interpolate(dict.shippingEstimatePage, { amount }),
    onlyLeft: (count: number) => interpolate(dict.onlyLeft, { count }),
    dispatchOver: (window: string) =>
      interpolate(dict.dispatchOver, { window, threshold }),
    shippingReturnsBlurb: (value: number) =>
      interpolate(dict.shippingReturnsBlurb, {
        threshold: formatMoney(moneyFromNumber(value), NUMBER_LOCALES[locale]),
      }),
    saveToWishlist: (title: string) => interpolate(dict.saveToWishlist, { title }),
    removeFromWishlist: (title: string) =>
      interpolate(dict.removeFromWishlist, { title }),
    openWishlist: (count: number) => interpolate(dict.openWishlist, { count }),
    saveAmount: (amount: string) => interpolate(dict.saveAmount, { amount }),
    searchNoResults: (term: string) => interpolate(dict.searchNoResults, { term }),
    trustFreeShipping: interpolate(dict.trustFreeShipping, { threshold }),
  };
}

export type Messages = ReturnType<typeof bind>;

const catalogs: Record<Locale, Messages> = {
  en: bind(enJson, "en"),
  fi: bind(fiJson, "fi"),
  sv: bind(svJson, "sv"),
};

export function getMessages(locale: Locale): Messages {
  return catalogs[locale];
}

export function dictionaryKeys(): string[] {
  return Object.keys(enJson).sort();
}

export function dictionariesShareKeys(): boolean {
  const expected = dictionaryKeys().join(",");
  return LOCALES.every(
    (locale) => Object.keys(dictionaries[locale]).sort().join(",") === expected,
  );
}
