import "server-only";

import { cookies } from "next/headers";
import { CART_COOKIE_MAX_AGE, CART_COOKIE_NAME } from "@/lib/constants";
import type { CommerceMode } from "@/lib/commerce/types";

export interface DemoCartLineRecord {
  id: string;
  merchandiseId: string;
  quantity: number;
}

export type CartCookie =
  | { mode: "shopify"; id: string }
  | { mode: "demo"; id: string; lines: DemoCartLineRecord[] };

function isCartCookie(value: unknown): value is CartCookie {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  if (record.mode === "shopify" && typeof record.id === "string") {
    return true;
  }

  return (
    record.mode === "demo" &&
    typeof record.id === "string" &&
    Array.isArray(record.lines)
  );
}

export async function readCartCookie(): Promise<CartCookie | null> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE_NAME)?.value;
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return isCartCookie(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeCartCookie(value: CartCookie): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE_NAME, JSON.stringify(value), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

export async function clearCartCookie(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE_NAME);
}

export function cookieMatchesMode(
  cookie: CartCookie | null,
  mode: CommerceMode,
): cookie is CartCookie {
  return cookie?.mode === mode;
}
