import { test } from "@playwright/test";
import path from "node:path";

test("capture storefront screenshots", async ({ page }) => {
  test.skip(!process.env.SCREENSHOTS, "Set SCREENSHOTS=1 to write docs/screenshots");

  const out = path.join(process.cwd(), "docs", "screenshots");
  const routes = [
    { url: "/en", name: "home" },
    { url: "/en/collections/dogs", name: "collection" },
    { url: "/en/products/trail-harness", name: "product" },
    { url: "/en/cart", name: "cart" },
    { url: "/en/wishlist", name: "wishlist" },
    { url: "/en/search?q=oak", name: "search" },
    { url: "/en/cookies", name: "cookies" },
    { url: "/en/demo/analytics", name: "analytics" },
  ];

  for (const width of [375, 768, 1440] as const) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    for (const route of routes) {
      await page.goto(route.url);
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: path.join(out, `${route.name}-${width}.png`),
        fullPage: true,
      });
    }
  }
});
