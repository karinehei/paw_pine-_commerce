import { expect, test, type Page } from "@playwright/test";

async function dismissCookieBanner(page: Page) {
  const banner = page.getByRole("region", { name: "Cookies" });
  await banner.getByRole("button", { name: "Necessary only" }).click();
  await expect(banner).toHaveCount(0);
}

test("cart delivery estimate shows demo FI rates for a valid postcode", async ({
  page,
}) => {
  await page.goto("/en/products/oakwood-chew-ring");
  await dismissCookieBanner(page);
  await page.getByRole("button", { name: /add to bag/i }).click();
  const bag = page.getByRole("dialog", { name: "Bag" });
  await expect(bag).toBeVisible();
  await bag.getByRole("link", { name: /view bag/i }).click();
  await expect(page).toHaveURL(/\/cart/);

  await expect(page.getByRole("heading", { name: "Delivery estimate" })).toBeVisible();
  await expect(
    page.getByText(
      "Demo delivery rates. Final delivery options are confirmed during Shopify Checkout.",
    ),
  ).toBeVisible();

  const postcode = page.getByLabel(/finnish postal code/i);
  await postcode.fill("0010");
  await page.getByRole("button", { name: /show rates/i }).click();
  await expect(page.getByRole("status")).toContainText(/5-digit finnish postal code/i);

  await postcode.fill("00100");
  await page.getByRole("button", { name: /show rates/i }).click();
  await expect(page.getByText("Parcel locker")).toBeVisible();
  await expect(page.getByText("€5.90")).toBeVisible();
  await expect(page.getByText("Service point")).toBeVisible();
  await expect(page.getByText("€6.50")).toBeVisible();
  await expect(page.getByText("Home delivery")).toBeVisible();
  await expect(page.getByText("€12.90")).toBeVisible();
});

test("unavailable variants offer a simulated restock notification", async ({ page }) => {
  await page.goto("/en/products/trail-harness");
  await dismissCookieBanner(page);
  await page.getByRole("radio", { name: /size xl, out of stock/i }).click();
  await expect(page.getByText("Notify me when available")).toBeVisible();
  await expect(page.getByText(/do not send restock email/i)).toBeVisible();

  const email = page.locator("#back-in-stock-email");
  await email.fill("not-an-email");
  await page.getByRole("button", { name: /notify me/i }).click();
  await expect(page.getByRole("status")).toContainText(/valid email/i);

  await email.fill("wait@example.com");
  await page.getByRole("button", { name: /notify me/i }).click();
  await expect(page.getByRole("status")).toContainText(/simulated subscription/i);
});

test("newsletter subscribe is simulated", async ({ page }) => {
  await page.goto("/en/about");
  await dismissCookieBanner(page);
  const email = page.locator("#footer-newsletter-email").first();
  const form = email.locator("xpath=ancestor::form");
  await email.fill("not-an-email");
  await form.getByRole("button", { name: /^join$/i }).click();
  await expect(form.getByRole("status")).toContainText(/valid email/i);

  await email.fill("reader@example.com");
  await form.getByRole("button", { name: /^join$/i }).click();
  await expect(form.getByRole("status")).toContainText(/simulated signup/i);
  await expect(form.getByText(/simulated in this portfolio/i)).toBeVisible();
});

test("contact form is simulated", async ({ page }) => {
  await page.goto("/en/contact");
  await dismissCookieBanner(page);
  const form = page.locator("#main form");
  await expect(form.locator("#contact-demo-disclaimer")).toHaveText(
    /portfolio demo: the message is validated/i,
  );
  await form.getByLabel("Name").fill("Karin");
  await form.getByLabel("Email").fill("hello@example.com");
  await form.getByLabel("Message").fill("Question about the oak bowl size.");
  await form.getByRole("button", { name: /^send$/i }).click();
  await expect(form.getByRole("status")).toContainText(/simulated contact form/i);
});
