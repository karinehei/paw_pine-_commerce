import { describe, expect, it } from "vitest";
import { itemFromProduct } from "@/lib/analytics/items";
import { averageOrderValue, metricsFromEvents, rate } from "@/lib/analytics/funnel";
import { createAnalyticsRuntime } from "@/lib/analytics/events";
import { toDataLayerPayload } from "@/lib/analytics/providers";
import { demoProducts } from "@/lib/commerce/demo/catalog";
import type { EcommerceEvent } from "@/lib/analytics/types";

function trailHarness() {
  const product = demoProducts.find((item) => item.handle === "trail-harness");
  expect(product).toBeDefined();
  return product!;
}

describe("typed ecommerce events", () => {
  it("maps a product to an item payload", () => {
    const product = trailHarness();
    const variant = product.variants.find((item) => item.title === "M");
    const item = itemFromProduct(product, variant, 2);

    expect(item.id).toBe("trail-harness");
    expect(item.handle).toBe("trail-harness");
    expect(item.name).toBe("Trail Harness");
    expect(item.variant).toBe("M");
    expect(item.quantity).toBe(2);
    expect(item.price).toBe(68);
    expect(item.category).toBe("harnesses");
    expect(item.species).toBe("dog");
    expect(item.currency).toBe("EUR");
  });

  it("maps GA4 dataLayer payloads without any", () => {
    const event: EcommerceEvent = {
      name: "add_to_cart",
      currency: "EUR",
      value: 68,
      items: [itemFromProduct(trailHarness())],
    };
    const payload = toDataLayerPayload(event);
    expect(payload.event).toBe("add_to_cart");
    const ecommerce = payload.ecommerce as { items: Array<{ item_id: string }> };
    expect(ecommerce.items[0]?.item_id).toBe("trail-harness");
  });

  it("computes funnel rates from typed events", () => {
    const events: EcommerceEvent[] = [
      { name: "page_view", page_path: "/", page_title: "Home" },
      { name: "view_item", currency: "EUR", value: 28, items: [] },
      { name: "add_to_cart", currency: "EUR", value: 28, items: [] },
      { name: "begin_checkout", currency: "EUR", value: 28, items: [] },
      {
        name: "purchase",
        transaction_id: "demo-1",
        currency: "EUR",
        value: 28,
        items: [],
        demo: true,
      },
    ];
    const metrics = metricsFromEvents(events);
    expect(metrics.productViews).toBe(1);
    expect(rate(metrics.addToCarts, metrics.sessions)).toBe(1);
    expect(averageOrderValue(metrics)).toBe(28);
  });
});

describe("analytics runtime", () => {
  const addToCart: EcommerceEvent = {
    name: "add_to_cart",
    currency: "EUR",
    value: 28,
    items: [],
  };
  const beginCheckout: EcommerceEvent = {
    name: "begin_checkout",
    currency: "EUR",
    value: 28,
    items: [],
  };

  it("does not emit before consent", () => {
    const seen: EcommerceEvent[] = [];
    const runtime = createAnalyticsRuntime({
      isAllowed: () => false,
      providers: [
        {
          name: "test",
          track: (event) => {
            seen.push(event);
          },
        },
      ],
    });
    runtime.track(addToCart);
    runtime.track(beginCheckout);
    expect(seen).toHaveLength(0);
  });

  it("emits add_to_cart and begin_checkout after consent", () => {
    const seen: EcommerceEvent[] = [];
    const runtime = createAnalyticsRuntime({
      isAllowed: () => true,
      providers: [
        {
          name: "test",
          track: (event) => {
            seen.push(event);
          },
        },
      ],
    });
    runtime.track(addToCart);
    runtime.track(beginCheckout);
    expect(seen.map((event) => event.name)).toEqual(["add_to_cart", "begin_checkout"]);
  });

  it("drops identical events caused by rerenders", () => {
    let now = 1_000;
    const seen: EcommerceEvent[] = [];
    const runtime = createAnalyticsRuntime({
      isAllowed: () => true,
      now: () => now,
      dedupeWindowMs: 250,
      providers: [
        {
          name: "test",
          track: (event) => {
            seen.push(event);
          },
        },
      ],
    });
    const view: EcommerceEvent = {
      name: "view_item",
      currency: "EUR",
      value: 28,
      items: [],
    };
    runtime.track(view);
    runtime.track(view);
    expect(seen).toHaveLength(1);
    now = 2_000;
    runtime.track(view);
    expect(seen).toHaveLength(2);
  });
});
