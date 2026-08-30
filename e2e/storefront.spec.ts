import { expect, test } from "@playwright/test";

test("home page renders the storefront", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Quiet objects");
  await expect(page.getByRole("link", { name: /shop dogs/i })).toBeVisible();
});

test("collection filters update the URL", async ({ page }) => {
  await page.goto("/collections/dogs");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dogs");
  await page.locator("#filter-sort").selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);
});

test("product page can add an item to the bag", async ({ page }) => {
  await page.goto("/products/oakwood-chew-ring");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Oakwood Chew Ring");
  await page.getByRole("button", { name: /add to bag/i }).click();
  const bag = page.getByRole("dialog", { name: "Bag" });
  await expect(bag).toBeVisible();
  await expect(bag.getByRole("link", { name: "Oakwood Chew Ring" })).toBeVisible();
});

test("search state lives in the URL", async ({ page }) => {
  await page.goto("/search");
  await page.locator("#search-page").fill("harness");
  await page.locator("#search-page").press("Enter");
  await expect(page).toHaveURL(/q=harness/);
  await expect(page.getByText(/result/i)).toBeVisible();
});

test("about page is reachable", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("About Paw & Pine");
});

test("finnish home is available as a second language", async ({ page }) => {
  await page.goto("/fi");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Hiljaisia esineitä",
  );
  await expect(page.getByRole("link", { name: /koirille/i })).toBeVisible();
});

test("empty search shows an empty state", async ({ page }) => {
  await page.goto("/search?q=zzzz-not-a-product");
  await expect(page.getByRole("heading", { name: "No matching pieces" })).toBeVisible();
});
