import { expect, test } from "@playwright/test";

test("purchase funnel reaches the Shopify checkout boundary", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /shop dogs/i }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dogs");

  await page.getByRole("link", { name: /trail harness/i }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Trail Harness");

  await page.getByRole("radio", { name: /size m/i }).click();
  await page.getByRole("button", { name: /add to bag/i }).click();

  const bag = page.getByRole("dialog", { name: "Bag" });
  await expect(bag).toBeVisible();
  await expect(bag.getByRole("link", { name: "Trail Harness" })).toBeVisible();

  await bag.getByRole("button", { name: "Increase quantity" }).click();
  await expect(bag.getByText("2", { exact: true })).toBeVisible();

  await bag.getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/checkout=demo/);
  await expect(page.getByRole("status")).toContainText("checkout boundary");
});

test("out-of-stock variants cannot be added", async ({ page }) => {
  await page.goto("/products/trail-harness");
  await page.getByRole("radio", { name: /size xl, out of stock/i }).click();
  await expect(page.getByRole("button", { name: /out of stock/i })).toBeDisabled();
});

test("search suggestions appear for a short query", async ({ page }) => {
  await page.goto("/");
  await page.locator("#header-search").fill("har");
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.getByRole("option").first()).toContainText(/harness/i);
});

test("demo analytics page is labelled as demo data", async ({ page }) => {
  await page.goto("/demo/analytics");
  await expect(page.getByText(/demo data — not production traffic/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Illustrative demo dataset" })).toBeVisible();
});

test.describe("mobile navigation", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test("opens the menu and reaches a collection", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Dogs", exact: true }).click();
    await expect(page).toHaveURL(/collections\/dogs/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dogs");
  });
});
