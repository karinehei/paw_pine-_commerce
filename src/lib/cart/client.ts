import { isCommerceErrorCode } from "@/lib/commerce/errors";
import { LOCALE_HEADER, type Locale } from "@/lib/i18n/config";
import type { Cart } from "@/lib/commerce/types";
import type { CartMutationResult } from "@/lib/cart/types";

const CART_API = "/api/cart";
const NO_STORE: RequestCache = "no-store";

function localeHeaders(locale: Locale): HeadersInit {
  return {
    [LOCALE_HEADER]: locale,
  };
}

async function parseMutation(response: Response): Promise<CartMutationResult> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "ok" in body) {
      const record = body as { ok: unknown; cart?: Cart; code?: unknown };
      if (record.ok === true && record.cart) {
        return { ok: true, cart: record.cart };
      }
      if (record.ok === false && isCommerceErrorCode(record.code)) {
        return { ok: false, code: record.code };
      }
    }
  } catch {
    /* fall through */
  }
  return { ok: false, code: response.status >= 500 ? "unavailable" : "network" };
}

async function mutate(
  locale: Locale,
  body: Record<string, unknown>,
): Promise<CartMutationResult> {
  try {
    const response = await fetch(CART_API, {
      method: "POST",
      credentials: "include",
      cache: NO_STORE,
      headers: {
        ...localeHeaders(locale),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return parseMutation(response);
  } catch {
    return { ok: false, code: "network" };
  }
}

export async function fetchCart(locale: Locale): Promise<Cart | null> {
  try {
    const response = await fetch(CART_API, {
      credentials: "include",
      cache: NO_STORE,
      headers: localeHeaders(locale),
    });
    if (!response.ok) {
      return null;
    }
    const body: unknown = await response.json();
    if (
      body &&
      typeof body === "object" &&
      "ok" in body &&
      (body as { ok: unknown }).ok === true
    ) {
      const cart = (body as { cart?: Cart | null }).cart;
      return cart ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

export function addItemToCart(
  locale: Locale,
  variantId: string,
  quantity: number,
): Promise<CartMutationResult> {
  return mutate(locale, { op: "add", variantId, quantity });
}

export function updateCartItem(
  locale: Locale,
  lineId: string,
  quantity: number,
): Promise<CartMutationResult> {
  return mutate(locale, { op: "update", lineId, quantity });
}

export function removeCartItem(
  locale: Locale,
  lineId: string,
): Promise<CartMutationResult> {
  return mutate(locale, { op: "remove", lineId });
}
