"use client";

import { formatMoney, parseAmount } from "@/lib/format";
import type { Money } from "@/lib/commerce/types";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { numberLocale } from "@/lib/i18n/config";

interface ProductPriceProps {
  price: Money;
  compareAtPrice?: Money | null;
  className?: string;
}

export function ProductPrice({
  price,
  compareAtPrice,
  className = "",
}: ProductPriceProps) {
  const locale = numberLocale(useLocale());
  const onSale = Boolean(
    compareAtPrice && parseAmount(compareAtPrice) > parseAmount(price),
  );

  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className={onSale ? "text-sale" : "text-ink"}>
        {formatMoney(price, locale)}
      </span>
      {onSale && compareAtPrice ? (
        <span className="text-muted text-sm line-through">
          {formatMoney(compareAtPrice, locale)}
        </span>
      ) : null}
    </p>
  );
}
