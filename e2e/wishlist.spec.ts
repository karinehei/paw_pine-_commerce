import { expect, test } from "@playwright/test";

test("wishlist saves, persists, and removes on this device", async ({ page }) => {
  await page.goto("/en/products/oakwood-chew-ring");
  await page.getByRole("button", { name: "Save Oakwood Chew Ring to wishlist" }).click();
  await expect(
    page.getByRole("button", { name: "Remove Oakwood Chew Ring from wishlist" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /wishlist, 1/i })).toBeVisible();

  await page.getByRole("link", { name: /wishlist, 1/i }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Wishlist");
  await expect(page.getByRole("heading", { name: "Oakwood Chew Ring" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Oakwood Chew Ring" })).toBeVisible();

  await page
    .getByRole("button", { name: "Remove Oakwood Chew Ring from wishlist" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your wishlist is empty" }),
  ).toBeVisible();
});

test("recently viewed lists the previous product and related items stay on-species", async ({
  page,
}) => {
  await page.goto("/en/products/oakwood-chew-ring");
  await page.goto("/en/products/trail-harness");
  await expect(page.getByRole("heading", { name: "Recently viewed" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /oakwood chew ring/i }).first(),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "You may also like" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Everyday Walk Harness" }),
  ).toBeVisible();
});
