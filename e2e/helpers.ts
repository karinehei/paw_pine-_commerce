import { expect, type Page } from "@playwright/test";

/** Cookie UI hydrates after first paint. Wait for it, then dismiss. */
export async function dismissCookieBanner(page: Page) {
  const banner = page.getByRole("region", { name: "Cookies" });
  await expect(banner.getByRole("button", { name: /necessary only/i })).toBeVisible();
  await banner.getByRole("button", { name: /necessary only/i }).click();
  await expect(banner).toHaveCount(0);
}
