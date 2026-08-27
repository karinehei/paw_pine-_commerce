"use server";

import { CommerceError } from "@/lib/commerce/errors";
import { getCommerceProvider } from "@/lib/commerce/provider";
import {
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
    return await getCommerceProvider().getCart(cookie.id);
  } catch (error) {
    if (error instanceof CommerceError && error.code === "invalid_cart") {
      return null;
    }
    throw error;
  }
}

async function ensureCartId(): Promise<string> {
  const mode = getCommerceMode();
  const cookie = await readCartCookie();
  if (cookieMatchesMode(cookie, mode)) {
    return cookie.id;
  }

  const cart = await getCommerceProvider().createCart();
  if (mode === "shopify") {
    await writeCartCookie({ mode: "shopify", id: cart.id });
  }
  return cart.id;
}

export async function addItemToCart(variantId: string, quantity: number): Promise<Cart> {
  if (quantity < 1) {
    throw new CommerceError("invalid_cart");
  }

  const provider = getCommerceProvider();
  const cartId = await ensureCartId();
  const cart = await provider.addToCart(cartId, variantId, quantity);

  if (getCommerceMode() === "shopify") {
    await writeCartCookie({ mode: "shopify", id: cart.id });
  }

  return cart;
}

export async function updateCartItem(lineId: string, quantity: number): Promise<Cart> {
  const cookie = await readCartCookie();
  const mode = getCommerceMode();
  if (!cookieMatchesMode(cookie, mode)) {
    throw new CommerceError("invalid_cart");
  }

  return getCommerceProvider().updateCart(cookie.id, lineId, quantity);
}

export async function removeCartItem(lineId: string): Promise<Cart> {
  const cookie = await readCartCookie();
  const mode = getCommerceMode();
  if (!cookieMatchesMode(cookie, mode)) {
    throw new CommerceError("invalid_cart");
  }

  return getCommerceProvider().removeFromCart(cookie.id, lineId);
}
