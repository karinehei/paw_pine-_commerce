import { describe, expect, it } from "vitest";
import { demoProducts } from "@/lib/commerce/demo/catalog";
import { backInStockEligibility } from "@/lib/notifications/eligibility";
import { MockNotificationProvider } from "@/lib/notifications/mock";
import { MockNewsletterProvider } from "@/lib/newsletter/mock";
import { isEmail } from "@/lib/validation";

function trailHarness() {
  const product = demoProducts.find((item) => item.handle === "trail-harness");
  expect(product).toBeDefined();
  return product!;
}

describe("unavailable product back-in-stock", () => {
  it("allows a simulated subscribe only for an unavailable variant", async () => {
    const product = trailHarness();
    const xl = product.variants.find((item) => item.title === "XL");
    const m = product.variants.find((item) => item.title === "M");
    expect(xl?.availableForSale).toBe(false);
    expect(m?.availableForSale).toBe(true);

    expect(backInStockEligibility(product, xl?.id)).toBe("ok");
    expect(backInStockEligibility(product, m?.id)).toBe("in_stock");
    expect(backInStockEligibility(product)).toBe("in_stock");
    expect(backInStockEligibility(null)).toBe("not_found");
    expect(backInStockEligibility(product, "missing")).toBe("not_found");
  });

  it("validates email before a simulated subscription", async () => {
    expect(isEmail("")).toBe(false);
    expect(isEmail("wait@example.com")).toBe(true);
    const result = await new MockNotificationProvider().subscribeBackInStock({
      email: "wait@example.com",
      handle: "trail-harness",
    });
    expect(result).toEqual({ ok: true, demo: true });
  });
});

describe("newsletter provider", () => {
  it("acknowledges a simulated subscribe without sending mail", async () => {
    const result = await new MockNewsletterProvider().subscribe({
      email: "reader@example.com",
    });
    expect(result).toEqual({ ok: true, demo: true });
  });
});
