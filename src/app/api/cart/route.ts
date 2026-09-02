import { NextResponse } from "next/server";
import {
  addItemToCart,
  asCartResult,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/cart/service";
import type { CartMutationResult } from "@/lib/cart/types";
import { isSameOriginRequest } from "@/lib/security";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store" };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

function forbidden() {
  return json({ ok: false, code: "unavailable" }, 403);
}

export async function GET(request: Request) {
  if (!isSameOriginRequest(request, { requireOrigin: false })) {
    return forbidden();
  }

  try {
    const cart = await getCart();
    return json({ ok: true, cart });
  } catch (error) {
    return json(asCartResult(error), 503);
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return forbidden();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "invalid_cart" }, 400);
  }

  const record =
    typeof body === "object" && body ? (body as Record<string, unknown>) : {};
  const op = record.op;

  let result: CartMutationResult;
  if (op === "add" && typeof record.variantId === "string") {
    result = await addItemToCart(
      record.variantId,
      typeof record.quantity === "number" ? record.quantity : 1,
    );
  } else if (
    op === "update" &&
    typeof record.lineId === "string" &&
    typeof record.quantity === "number"
  ) {
    result = await updateCartItem(record.lineId, record.quantity);
  } else if (op === "remove" && typeof record.lineId === "string") {
    result = await removeCartItem(record.lineId);
  } else {
    return json({ ok: false, code: "invalid_cart" }, 400);
  }

  return json(result);
}
