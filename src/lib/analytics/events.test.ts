import { describe, expect, it } from "vitest";
import { itemFromProduct } from "@/lib/analytics/items";
import { averageOrderValue, metricsFromEvents, rate } from "@/lib/analytics/funnel";
import { demoProducts } from "@/lib/commerce/demo/catalog";
import type { AnalyticsEvent } from "@/lib/analytics/types";

describe("analytics events", () => {
  it("maps a product to an item payload", () => {
    const product = demoProducts.find((item) => item.handle === "trail-harness");
    expect(product).toBeDefined();
    const variant = product!.variants.find((item) => item.title === "M");
    const item = itemFromProduct(product!, variant, 2);

    expect(item.item_id).toBe("trail-harness");
    expect(item.item_variant).toBe("M");
    expect(item.quantity).toBe(2);
    expect(item.price).toBe(68);
  });

  it("computes funnel rates from typed events", () => {
    const events: AnalyticsEvent[] = [
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
