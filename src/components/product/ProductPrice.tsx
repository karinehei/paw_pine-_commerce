"use client";

import { formatMoney, parseAmount, savingsMoney } from "@/lib/format";
import type { Money } from "@/lib/commerce/types";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";
import { numberLocale } from "@/lib/i18n/config";

interface ProductPriceProps {
  price: Money;
  compareAtPrice?: Money | null;
  className?: string;
  showSavings?: boolean;
}

export function ProductPrice({
  price,
  compareAtPrice,
  className = "",
  showSavings = false,
}: ProductPriceProps) {
  const t = useMessages();
  const locale = numberLocale(useLocale());
  const onSale = Boolean(
    compareAtPrice && parseAmount(compareAtPrice) > parseAmount(price),
  );
  const saved = onSale ? savingsMoney(price, compareAtPrice) : null;

  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <span className="text-ink">{formatMoney(price, locale)}</span>
      {onSale && compareAtPrice ? (
        <span className="text-muted text-sm line-through">
          {formatMoney(compareAtPrice, locale)}
        </span>
      ) : null}
      {showSavings && saved ? (
        <span className="text-sale text-sm">
          {t.saveAmount(formatMoney(saved, locale))}
        </span>
      ) : null}
    </p>
  );
}
