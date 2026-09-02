import { describe, expect, it } from "vitest";
import { CommerceError } from "@/lib/commerce/errors";
import { assertLineQuantities, unwrapCart } from "@/lib/commerce/shopify/cart-payload";
import type { ShopifyUserErrorPayload } from "@/lib/commerce/shopify/storefront-types";

const variantId = "gid://shopify/ProductVariant/1";

function payload(
  overrides: Partial<ShopifyUserErrorPayload> & {
    cartLines?: NonNullable<ShopifyUserErrorPayload["cart"]>["lines"];
  } = {},
): ShopifyUserErrorPayload {
  const { cartLines, cart, ...rest } = overrides;
  return {
    userErrors: [],
    warnings: [],
    cart:
      cart === undefined
        ? {
            id: "gid://shopify/Cart/1",
            checkoutUrl: "https://paw-pine.myshopify.com/cart/c/abc",
            totalQuantity: 1,
            cost: {
              subtotalAmount: { amount: "24.00", currencyCode: "EUR" },
              totalAmount: { amount: "24.00", currencyCode: "EUR" },
            },
            lines: cartLines ?? {
              nodes: [
                {
                  id: "gid://shopify/CartLine/1",
                  quantity: 1,
                  merchandise: {
                    id: variantId,
                    title: "Default Title",
                    availableForSale: true,
                    selectedOptions: [],
                    price: { amount: "24.00", currencyCode: "EUR" },
                    compareAtPrice: null,
                  },
                },
              ],
            },
          }
        : cart,
    ...rest,
  };
}

function expectCommerceCode(run: () => void, code: CommerceError["code"]) {
  try {
    run();
    throw new Error(`expected ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(CommerceError);
    expect((error as CommerceError).code).toBe(code);
  }
}

describe("Shopify cart payload", () => {
  it("treats a missing line without a stock signal as an invalid cart", () => {
    expectCommerceCode(
      () =>
        assertLineQuantities(
          payload({
            cartLines: {
              nodes: [
                {
                  id: "gid://shopify/CartLine/ghost",
                  quantity: 0,
                  merchandise: {
                    id: variantId,
                    title: "Default Title",
                    availableForSale: true,
                    selectedOptions: [],
                    price: { amount: "0.00", currencyCode: "EUR" },
                    compareAtPrice: null,
                  },
                },
              ],
            },
          }),
          [variantId],
        ),
      "invalid_cart",
    );
  });

  it("treats a stock warning with no purchasable line as out of stock", () => {
    expectCommerceCode(
      () =>
        assertLineQuantities(
          payload({
            warnings: [{ code: "MERCHANDISE_OUT_OF_STOCK", message: "Out of stock" }],
            cartLines: { nodes: [] },
          }),
          [variantId],
        ),
      "out_of_stock",
    );
  });

  it("keeps a cart when a stock warning is leftover from a ghost line", () => {
    const cart = unwrapCart(
      payload({
        warnings: [{ code: "MERCHANDISE_OUT_OF_STOCK", message: "Out of stock" }],
      }),
    );
    expect(cart.lines).toHaveLength(1);
  });
});
