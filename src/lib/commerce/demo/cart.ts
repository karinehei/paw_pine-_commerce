import { randomUUID } from "node:crypto";
import { CommerceError } from "@/lib/commerce/errors";
import { findDemoVariant } from "@/lib/commerce/demo/catalog";
import type { DemoCartLineRecord } from "@/lib/commerce/demo/cart-cookie";
import type { Cart, CartLine, CartLineInput } from "@/lib/commerce/types";
import { moneyFromNumber, multiplyMoney, parseAmount } from "@/lib/format";

export function createDemoCartId(): string {
  return `demo-cart-${randomUUID()}`;
}

export function createDemoLineId(): string {
  return `demo-line-${randomUUID()}`;
}

export function hydrateDemoCart(id: string, records: DemoCartLineRecord[]): Cart {
  const lines: CartLine[] = [];

  for (const record of records) {
    const match = findDemoVariant(record.merchandiseId);
    if (!match) {
      continue;
    }

    const { product, variant } = match;
    lines.push({
      id: record.id,
      quantity: record.quantity,
      merchandise: {
        id: variant.id,
        title: variant.title,
        selectedOptions: variant.selectedOptions,
        price: variant.price,
        image: variant.image ?? product.featuredImage,
        product: {
          handle: product.handle,
          title: product.title,
          visual: product.visual,
        },
      },
      cost: {
        totalAmount: multiplyMoney(variant.price, record.quantity),
      },
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + parseAmount(line.cost.totalAmount), 0);
  const currency = lines[0]?.merchandise.price.currencyCode ?? "EUR";

  return {
    id,
    checkoutUrl: "/cart?checkout=demo",
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    lines,
    cost: {
      subtotalAmount: moneyFromNumber(subtotal, currency),
      totalAmount: moneyFromNumber(subtotal, currency),
    },
  };
}

export function addDemoLine(
  records: DemoCartLineRecord[],
  input: CartLineInput,
): DemoCartLineRecord[] {
  const match = findDemoVariant(input.variantId);
  if (!match) {
    throw new CommerceError("not_found", "That product is no longer available.");
  }

  if (!match.variant.availableForSale) {
    throw new CommerceError("out_of_stock");
  }

  const existing = records.find((line) => line.merchandiseId === input.variantId);
  if (existing) {
    return records.map((line) =>
      line.merchandiseId === input.variantId
        ? { ...line, quantity: line.quantity + input.quantity }
        : line,
    );
  }

  return [
    ...records,
    {
      id: createDemoLineId(),
      merchandiseId: input.variantId,
      quantity: input.quantity,
    },
  ];
}

export function updateDemoLine(
  records: DemoCartLineRecord[],
  lineId: string,
  quantity: number,
): DemoCartLineRecord[] {
  if (quantity <= 0) {
    return records.filter((line) => line.id !== lineId);
  }

  const exists = records.some((line) => line.id === lineId);
  if (!exists) {
    throw new CommerceError("invalid_cart");
  }

  return records.map((line) => (line.id === lineId ? { ...line, quantity } : line));
}

export function emptyDemoCart(): Cart {
  return hydrateDemoCart(createDemoCartId(), []);
}
