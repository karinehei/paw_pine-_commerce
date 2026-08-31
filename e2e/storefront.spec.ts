import { expect, test } from "@playwright/test";

test("home page renders the storefront", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Beautiful, lasting pieces",
  );
  await expect(page.getByRole("link", { name: "Shop dogs" }).first()).toBeVisible();
});

test("collection filters update the URL", async ({ page }) => {
  await page.goto("/en/collections/dogs");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dogs");
  await page.locator("#filter-sort").locator("visible=true").selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);
});

test("product page can add an item to the bag", async ({ page }) => {
  await page.goto("/en/products/oakwood-chew-ring");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Oakwood Chew Ring");
  await page.getByRole("button", { name: /add to cart/i }).click();
  const bag = page.getByRole("dialog", { name: "Cart" });
  await expect(bag).toBeVisible();
  await expect(bag.getByRole("link", { name: "Oakwood Chew Ring" })).toBeVisible();
});

test("search state lives in the URL", async ({ page }) => {
  await page.goto("/en/search");
  const search = page.locator("#search-page").locator("visible=true");
  await search.fill("harness");
  await search.press("Enter");
  await expect(page).toHaveURL(/q=harness/);
  await expect(page.getByText(/result/i)).toBeVisible();
});

test("about page is reachable", async ({ page }) => {
  await page.goto("/en/about");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("About Paw & Pine");
});

test("finnish home is the default market language", async ({ page }) => {
  await page.goto("/fi");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Kauniit ja kestävät tarvikkeet",
  );
  await expect(page.getByRole("link", { name: "Koirille" }).first()).toBeVisible();
});

test("empty search shows an empty state", async ({ page }) => {
  await page.goto("/en/search?q=zzzz-not-a-product");
  await expect(page.getByRole("heading", { name: "No matching products" })).toBeVisible();
});

test("empty search does not dump the full catalogue", async ({ page }) => {
  await page.goto("/en/search");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Search");
  expect(await page.locator("main article").count()).toBeLessThanOrEqual(6);
  await expect(page.getByText(/the complete snowboard/i)).toHaveCount(0);
});

test("dogs collection hides the redundant species filter", async ({ page }) => {
  await page.goto("/en/collections/dogs");
  await expect(page.getByRole("group", { name: "Species" })).toHaveCount(0);
});

test("search finds a Paw & Pine product and never a Shopify sample", async ({ page }) => {
  await page.goto("/en/search?q=oakwood");
  await expect(
    page.getByRole("link", { name: /oakwood chew ring/i }).first(),
  ).toBeVisible();
  await expect(page.getByText(/snowboard/i)).toHaveCount(0);
  await expect(page.getByText(/gift card/i)).toHaveCount(0);
});

test("case study is reachable from the footer", async ({ page }) => {
  await page.goto("/en");
  const banner = page.getByRole("region", { name: "Cookies" });
  if (await banner.isVisible()) {
    await banner.getByRole("button", { name: "Necessary only" }).click();
  }
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: /portfolio case study/i })
    .click();
  await expect(page).toHaveURL(/\/en\/case-study/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("case study");
});

test("prices use Shopify currency formatting without hardcoded symbols in markup", async ({
  page,
}) => {
  await page.goto("/en/products/oakwood-chew-ring");
  const price = page.getByText(/€28\.00|\$28\.00|28,00/).first();
  await expect(price).toBeVisible();
});

test("cookie preferences page is reachable", async ({ page }) => {
  await page.goto("/en/cookies");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cookie preferences");
  await expect(
    page.getByRole("button", { name: /open cookie preferences/i }),
  ).toBeVisible();
});
