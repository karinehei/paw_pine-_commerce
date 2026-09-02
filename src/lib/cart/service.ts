import "server-only";

import { CommerceError } from "@/lib/commerce/errors";
import {
  clampQuantity,
  isCartLineId,
  isMerchandiseId,
  isShopifyCartGid,
  MAX_LINE_QUANTITY,
} from "@/lib/security";
import { getCommerceProvider } from "@/lib/commerce/provider";
import {
  clearCartCookie,
  cookieMatchesMode,
  readCartCookie,
  writeCartCookie,
} from "@/lib/commerce/demo/cart-cookie";
import { getCommerceMode } from "@/lib/env";
import type { Cart } from "@/lib/commerce/types";
import type { CartMutationResult } from "@/lib/cart/types";

export function asCartResult(error: unknown): CartMutationResult {
  if (error instanceof CommerceError) {
    return { ok: false, code: error.code };
  }
  return { ok: false, code: "unavailable" };
}

export async function getCart(): Promise<Cart | null> {
  const mode = getCommerceMode();
  const cookie = await readCartCookie();
  if (!cookieMatchesMode(cookie, mode)) {
    return null;
  }

  try {
    const cart = await getCommerceProvider().getCart(cookie.id);
    if (!cart) {
      await clearCartCookie();
      return null;
    }
    return cart;
  } catch (error) {
    if (error instanceof CommerceError && error.code === "invalid_cart") {
      await clearCartCookie();
      return null;
    }
    throw error;
  }
}

async function persistShopifyCart(cart: Cart): Promise<void> {
  if (getCommerceMode() !== "shopify") {
    return;
  }
  if (!isShopifyCartGid(cart.id)) {
    throw new CommerceError("invalid_cart");
  }
  await writeCartCookie({ mode: "shopify", id: cart.id });
}

async function ensureCartId(): Promise<string> {
  const mode = getCommerceMode();
  const cookie = await readCartCookie();
  if (cookieMatchesMode(cookie, mode)) {
    return cookie.id;
  }

  const cart = await getCommerceProvider().createCart();
  await persistShopifyCart(cart);
  return cart.id;
}

export async function addItemToCart(
  variantId: string,
  quantity: number,
): Promise<CartMutationResult> {
  if (!isMerchandiseId(variantId)) {
    return { ok: false, code: "invalid_cart" };
  }

  const safeQuantity = clampQuantity(quantity);
  if (safeQuantity < 1 || safeQuantity > MAX_LINE_QUANTITY) {
    return { ok: false, code: "invalid_cart" };
  }

  const provider = getCommerceProvider();

  try {
    const cartId = await ensureCartId();
    try {
      const cart = await provider.addToCart(cartId, variantId, safeQuantity);
      await persistShopifyCart(cart);
      return { ok: true, cart };
    } catch (error) {
      if (error instanceof CommerceError && error.code === "invalid_cart") {
        await clearCartCookie();
        const cart = await provider.createCart([{ variantId, quantity: safeQuantity }]);
        await persistShopifyCart(cart);
        return { ok: true, cart };
      }
      throw error;
    }
  } catch (error) {
    return asCartResult(error);
  }
}

export async function updateCartItem(
  lineId: string,
  quantity: number,
): Promise<CartMutationResult> {
  if (!isCartLineId(lineId) || !Number.isFinite(quantity)) {
    return { ok: false, code: "invalid_cart" };
  }

  const cookie = await readCartCookie();
  const mode = getCommerceMode();
  if (!cookieMatchesMode(cookie, mode)) {
    return { ok: false, code: "invalid_cart" };
  }

  try {
    const cart = await getCommerceProvider().updateCart(
      cookie.id,
      lineId,
      quantity <= 0 ? 0 : clampQuantity(quantity),
    );
    return { ok: true, cart };
  } catch (error) {
    if (error instanceof CommerceError && error.code === "invalid_cart") {
      await clearCartCookie();
    }
    return asCartResult(error);
  }
}

export async function removeCartItem(lineId: string): Promise<CartMutationResult> {
  if (!isCartLineId(lineId)) {
    return { ok: false, code: "invalid_cart" };
  }

  const cookie = await readCartCookie();
  const mode = getCommerceMode();
  if (!cookieMatchesMode(cookie, mode)) {
    return { ok: false, code: "invalid_cart" };
  }

  try {
    const cart = await getCommerceProvider().removeFromCart(cookie.id, lineId);
    return { ok: true, cart };
  } catch (error) {
    if (error instanceof CommerceError && error.code === "invalid_cart") {
      await clearCartCookie();
    }
    return asCartResult(error);
  }
}
