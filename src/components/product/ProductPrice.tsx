import { formatMoney, parseAmount } from "@/lib/format";
import type { Money } from "@/lib/commerce/types";

interface ProductPriceProps {
  price: Money;
  compareAtPrice?: Money | null;
  className?: string;
}

export function ProductPrice({ price, compareAtPrice, className = "" }: ProductPriceProps) {
  const onSale = Boolean(
    compareAtPrice && parseAmount(compareAtPrice) > parseAmount(price),
  );

  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className={onSale ? "text-sale" : "text-ink"}>{formatMoney(price)}</span>
      {onSale && compareAtPrice ? (
        <span className="text-sm text-muted line-through">{formatMoney(compareAtPrice)}</span>
      ) : null}
    </p>
  );
}
