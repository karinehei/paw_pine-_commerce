import { CommerceError } from "@/lib/commerce/errors";
import { demoCatalogApi } from "@/lib/commerce/demo/catalog-api";
import {
  addDemoLine,
  createDemoCartId,
  emptyDemoCart,
  hydrateDemoCart,
  updateDemoLine,
} from "@/lib/commerce/demo/cart";
import {
  readCartCookie,
  writeCartCookie,
  type DemoCartLineRecord,
} from "@/lib/commerce/demo/cart-cookie";
import type { Cart, CartLineInput, CommerceProvider } from "@/lib/commerce/types";

async function readDemoLines(): Promise<{ id: string; lines: DemoCartLineRecord[] }> {
  const cookie = await readCartCookie();
  if (cookie?.mode === "demo") {
    return { id: cookie.id, lines: cookie.lines };
  }
  return { id: createDemoCartId(), lines: [] };
}

async function persistDemoCart(id: string, lines: DemoCartLineRecord[]): Promise<Cart> {
  await writeCartCookie({ mode: "demo", id, lines });
  return hydrateDemoCart(id, lines);
}

export const demoProvider: CommerceProvider = {
  ...demoCatalogApi,

  async getCart(cartId: string) {
    const cookie = await readCartCookie();
    if (cookie?.mode !== "demo" || cookie.id !== cartId) {
      return null;
    }
    return hydrateDemoCart(cookie.id, cookie.lines);
  },

  async createCart(lines: CartLineInput[] = []) {
    let records: DemoCartLineRecord[] = [];
    for (const line of lines) {
      records = addDemoLine(records, line);
    }
    return persistDemoCart(createDemoCartId(), records);
  },

  async addToCart(cartId: string, variantId: string, quantity: number) {
    const current = await readDemoLines();
    const id = current.lines.length > 0 ? current.id : cartId || current.id;
    const records = addDemoLine(current.lines, { variantId, quantity });
    return persistDemoCart(id, records);
  },

  async updateCart(cartId: string, lineId: string, quantity: number) {
    const current = await readDemoLines();
    if (current.id !== cartId) {
      throw new CommerceError("invalid_cart");
    }
    return persistDemoCart(current.id, updateDemoLine(current.lines, lineId, quantity));
  },

  async removeFromCart(cartId: string, lineId: string) {
    return this.updateCart(cartId, lineId, 0);
  },
};

export function getEmptyDemoCart(): Cart {
  return emptyDemoCart();
}
