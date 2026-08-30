import { expect, test } from "@playwright/test";

test("home page renders the storefront", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Quiet objects");
  await expect(page.getByRole("link", { name: /shop dogs/i })).toBeVisible();
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
  await page.getByRole("button", { name: /add to bag/i }).click();
  const bag = page.getByRole("dialog", { name: "Bag" });
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
    "Hiljaisia esineitä",
  );
  await expect(page.getByRole("link", { name: /koirille/i })).toBeVisible();
});

test("empty search shows an empty state", async ({ page }) => {
  await page.goto("/en/search?q=zzzz-not-a-product");
  await expect(page.getByRole("heading", { name: "No matching pieces" })).toBeVisible();
});

test("cookie preferences page is reachable", async ({ page }) => {
  await page.goto("/en/cookies");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cookie preferences");
  await expect(page.getByRole("button", { name: /open cookie preferences/i })).toBeVisible();
});
