import { expect, test } from "@playwright/test";

test("cookie banner can accept analytics and persists", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByRole("region", { name: "Cookies" });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Accept analytics" }).click();
  await expect(banner).toBeHidden();

  const cookies = await page.context().cookies();
  expect(
    cookies.some(
      (item) => item.name === "paw_pine_consent" && item.value === "analytics",
    ),
  ).toBe(true);

  await page.reload();
  await expect(page.getByRole("region", { name: "Cookies" })).toHaveCount(0);
});

test("analytics events stay off until consent, then add_to_cart and begin_checkout fire once", async ({
  page,
}) => {
  await page.goto("/products/oakwood-chew-ring");
  await page.getByRole("button", { name: /add to bag/i }).click();
  const bag = page.getByRole("dialog", { name: "Bag" });
  await expect(bag).toBeVisible();
  await bag.getByRole("button", { name: "Close" }).click();

  const before = await page.evaluate(() => window.dataLayer ?? []);
  expect(before.some((entry) => entry.event === "add_to_cart")).toBe(false);

  await page.getByRole("button", { name: "Accept analytics" }).click();
  await page.getByRole("button", { name: /add to bag/i }).click();

  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          (window.dataLayer ?? []).filter((entry) => entry.event === "add_to_cart")
            .length,
      ),
    )
    .toBe(1);

  await page
    .getByRole("dialog", { name: "Bag" })
    .getByRole("link", { name: "Checkout" })
    .click();
  await expect(page).toHaveURL(/checkout=demo/);

  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          (window.dataLayer ?? []).filter((entry) => entry.event === "begin_checkout")
            .length,
      ),
    )
    .toBe(1);
});

test("cookie preferences remain available from the footer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Necessary only" }).click();
  await page.getByRole("button", { name: "Cookie preferences" }).click();
  const dialog = page.getByRole("dialog", { name: "Cookie preferences" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("checkbox", { name: /optional measurement/i }).check();
  await dialog.getByRole("button", { name: "Save preferences" }).click();
  await expect(dialog).toBeHidden();
});
