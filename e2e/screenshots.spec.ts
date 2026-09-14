import { test } from "@playwright/test";
import path from "node:path";

test("capture storefront screenshots", async ({ page }) => {
  test.skip(!process.env.SCREENSHOTS, "Set SCREENSHOTS=1 to write docs/screenshots");
  test.setTimeout(180_000);

  const out = path.join(process.cwd(), "docs", "screenshots");

  async function visit(url: string) {
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    const necessary = page.getByRole("button", { name: /necessary only/i });
    if (await necessary.isVisible().catch(() => false)) {
      await necessary.click();
      await page.getByRole("region", { name: "Cookies" }).waitFor({ state: "hidden" });
    }
    await page.waitForTimeout(300);
  }

  async function shoot(name: string, width: number) {
    await page.screenshot({
      path: path.join(out, `${name}-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await visit("/en/products/oakwood-chew-ring");
  await page.getByRole("button", { name: /add to cart/i }).click();
  const bag = page.getByRole("dialog", { name: "Cart" });
  await bag.waitFor();
  await bag.getByRole("button", { name: /^close$/i }).click();
  await bag.waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Save Oakwood Chew Ring to wishlist" }).click();

  for (const width of [375, 768, 1440] as const) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });

    await visit("/en");
    await shoot("home", width);

    await visit("/en/collections/dogs");
    await shoot("collection", width);

    await visit("/en/products/trail-harness");
    await shoot("product", width);

    await visit("/en/cart");
    await shoot("cart", width);

    await visit("/en/wishlist");
    await shoot("wishlist", width);

    await visit("/en/search?q=oak");
    await shoot("search", width);

    await visit("/en/cookies");
    await shoot("cookies", width);

    await visit("/en/demo/analytics");
    await shoot("analytics", width);

    await visit("/en/case-study");
    await shoot("case-study", width);
  }
});
