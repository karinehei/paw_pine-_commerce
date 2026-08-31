import { DEFAULT_CURRENCY, SITE_NAME } from "@/lib/constants";
import type { Money, Product, ProductVariant } from "@/lib/commerce/types";

export function parseAmount(money: Money): number {
  const value = Number.parseFloat(money.amount);
  return Number.isFinite(value) ? value : 0;
}

export function formatMoney(money: Money, locale = "en-GB"): string {
  const amount = parseAmount(money);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode || DEFAULT_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function moneyFromNumber(amount: number, currencyCode = DEFAULT_CURRENCY): Money {
  return {
    amount: amount.toFixed(2),
    currencyCode,
  };
}

export function multiplyMoney(money: Money, quantity: number): Money {
  return moneyFromNumber(parseAmount(money) * quantity, money.currencyCode);
}

export function selectedOptionsLabel(
  options: ProductVariant["selectedOptions"],
  fallback = "",
): string {
  const values = options
    .filter(
      (option) =>
        option.value.toLowerCase() !== "default title" &&
        option.value.toLowerCase() !== "default",
    )
    .map((option) => option.value);

  return values.length > 0 ? values.join(" / ") : fallback;
}

export function variantLabel(variant: ProductVariant): string {
  return selectedOptionsLabel(variant.selectedOptions, variant.title);
}

export function productAlt(product: Pick<Product, "title">, suffix?: string): string {
  return suffix ? `${product.title}, ${suffix}` : `${product.title} from ${SITE_NAME}`;
}

export function savingsMoney(
  price: Money,
  compareAt: Money | null | undefined,
): Money | null {
  if (!compareAt) {
    return null;
  }
  const saved = parseAmount(compareAt) - parseAmount(price);
  if (saved <= 0) {
    return null;
  }
  return moneyFromNumber(saved, price.currencyCode || compareAt.currencyCode);
}

export function hasSalePrice(product: Product): boolean {
  const compare = product.compareAtPriceRange.minVariantPrice;
  if (!compare) {
    return false;
  }

  return parseAmount(compare) > parseAmount(product.priceRange.minVariantPrice);
}

export function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
