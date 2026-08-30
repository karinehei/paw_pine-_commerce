import { expect, test } from "@playwright/test";

test("root URL redirects to Finnish as the default market", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/fi\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Hiljaisia esineitä",
  );
});

test("language switcher keeps the product and search query", async ({ page }) => {
  await page.goto("/en/products/oakwood-chew-ring");
  await page
    .getByRole("navigation", { name: "Language" })
    .getByRole("link", { name: "SV" })
    .click();
  await expect(page).toHaveURL(/\/sv\/products\/oakwood-chew-ring/);
  await expect(page.getByRole("navigation", { name: "Språk" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Oakwood Chew Ring");
  await expect(page.getByRole("button", { name: /lägg i kassen/i })).toBeVisible();

  await page.goto("/en/search?q=oak");
  await page
    .getByRole("navigation", { name: "Language" })
    .getByRole("link", { name: "FI" })
    .click();
  await expect(page).toHaveURL(/\/fi\/search\?q=oak/);
  await expect(page.getByRole("navigation", { name: "Kieli" })).toBeVisible();
});

test("swedish home localizes chrome without inventing product copy", async ({ page }) => {
  await page.goto("/sv");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Stillsamma föremål",
  );
  await expect(page.getByRole("link", { name: /till hundar/i })).toBeVisible();
});

test("canonical and hreflang point at prefixed locale URLs", async ({ page }) => {
  await page.goto("/en/about");
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", /\/en\/about$/);
  await expect(page.locator('link[rel="alternate"][hreflang="fi"]')).toHaveAttribute(
    "href",
    /\/fi\/about$/,
  );
  await expect(page.locator('link[rel="alternate"][hreflang="sv"]')).toHaveAttribute(
    "href",
    /\/sv\/about$/,
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveAttribute("href", /\/fi\/about$/);
});

test("unknown locale is not rewritten into a real page", async ({ page }) => {
  const response = await page.goto("/de/collections/dogs");
  expect(response?.status()).toBe(404);
});
