import { test } from "@playwright/test";
import path from "node:path";

test("capture storefront screenshots", async ({ page }) => {
  test.skip(!process.env.SCREENSHOTS, "Set SCREENSHOTS=1 to write docs/screenshots");

  const out = path.join(process.cwd(), "docs", "screenshots");
  const routes = [
    { url: "/", name: "home" },
    { url: "/collections/dogs", name: "collection" },
    { url: "/products/trail-harness", name: "product" },
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
