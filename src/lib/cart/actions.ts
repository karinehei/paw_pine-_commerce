"use server";

import { CommerceError } from "@/lib/commerce/errors";
import { clampQuantity, isShopifyCartGid, MAX_LINE_QUANTITY } from "@/lib/security";
import { getCommerceProvider } from "@/lib/commerce/provider";
import {
  clearCartCookie,
  cookieMatchesMode,
  readCartCookie,
  writeCartCookie,
} from "@/lib/commerce/demo/cart-cookie";
import { getCommerceMode } from "@/lib/env";
import type { Cart } from "@/lib/commerce/types";

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

export async function addItemToCart(variantId: string, quantity: number): Promise<Cart> {
  const safeQuantity = clampQuantity(quantity);
  if (safeQuantity < 1 || safeQuantity > MAX_LINE_QUANTITY) {
    throw new CommerceError("invalid_cart");
  }

  const provider = getCommerceProvider();
  const cartId = await ensureCartId();

  try {
    const cart = await provider.addToCart(cartId, variantId, safeQuantity);
    await persistShopifyCart(cart);
    return cart;
  } catch (error) {
    if (error instanceof CommerceError && error.code === "invalid_cart") {
      await clearCartCookie();
      const cart = await provider.createCart([{ variantId, quantity: safeQuantity }]);
      await persistShopifyCart(cart);
      return cart;
    }
    throw error;
  }
}

export async function updateCartItem(lineId: string, quantity: number): Promise<Cart> {
  const cookie = await readCartCookie();
  const mode = getCommerceMode();
  if (!cookieMatchesMode(cookie, mode)) {
    throw new CommerceError("invalid_cart");
  }

  try {
    return await getCommerceProvider().updateCart(
      cookie.id,
      lineId,
      quantity <= 0 ? 0 : clampQuantity(quantity),
    );
  } catch (error) {
    if (error instanceof CommerceError && error.code === "invalid_cart") {
      await clearCartCookie();
    }
    throw error;
  }
}

export async function removeCartItem(lineId: string): Promise<Cart> {
  const cookie = await readCartCookie();
  const mode = getCommerceMode();
  if (!cookieMatchesMode(cookie, mode)) {
    throw new CommerceError("invalid_cart");
  }

  try {
    return await getCommerceProvider().removeFromCart(cookie.id, lineId);
  } catch (error) {
    if (error instanceof CommerceError && error.code === "invalid_cart") {
      await clearCartCookie();
    }
    throw error;
  }
}
