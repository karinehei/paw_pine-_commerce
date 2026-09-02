import { CommerceError } from "@/lib/commerce/errors";
import { mapCart } from "@/lib/commerce/shopify/mapper";
import type { ShopifyUserErrorPayload } from "@/lib/commerce/shopify/storefront-types";
import type { Cart } from "@/lib/commerce/types";

export function sameMerchandiseId(left?: string | null, right?: string | null): boolean {
  if (!left || !right) {
    return false;
  }
  const normalise = (id: string) => decodeURIComponent(id).split("?")[0];
  return normalise(left) === normalise(right);
}

function stockSignal(payload: ShopifyUserErrorPayload | null | undefined): boolean {
  const entries = [...(payload?.userErrors ?? []), ...(payload?.warnings ?? [])];
  return entries.some((entry) => {
    const text = `${entry.code ?? ""} ${entry.message ?? ""}`.toLowerCase();
    return text.includes("stock") || text.includes("inventory");
  });
}

export function purchasableLine(
  payload: ShopifyUserErrorPayload | null | undefined,
  variantId: string,
) {
  const nodes = payload?.cart?.lines?.nodes ?? [];
  return nodes.find(
    (node) => node.quantity >= 1 && sameMerchandiseId(node.merchandise?.id, variantId),
  );
}

export function unwrapCart(payload: ShopifyUserErrorPayload | null | undefined): Cart {
  if (payload?.userErrors?.length) {
    const first = payload.userErrors[0];
    const message = first?.message ?? "";
    const code = first?.code?.toLowerCase() ?? "";
    const lower = message.toLowerCase();
    if (
      code.includes("not_found") ||
      lower.includes("not found") ||
      lower.includes("does not exist") ||
      lower.includes("expired")
    ) {
      throw new CommerceError("invalid_cart");
    }
    if (
      stockSignal(payload) &&
      !(payload.cart?.lines?.nodes ?? []).some((node) => node.quantity >= 1)
    ) {
      throw new CommerceError("out_of_stock");
    }
    if (payload.cart) {
      return mapCart(payload.cart);
    }
    throw new CommerceError("invalid_cart");
  }
  if (!payload?.cart) {
    throw new CommerceError("invalid_cart");
  }
  return mapCart(payload.cart);
}

export function assertLineQuantities(
  payload: ShopifyUserErrorPayload | null | undefined,
  variantIds: string[],
) {
  for (const variantId of variantIds) {
    if (purchasableLine(payload, variantId)) {
      continue;
    }
    if (stockSignal(payload)) {
      throw new CommerceError("out_of_stock");
    }
    throw new CommerceError("invalid_cart");
  }
}
