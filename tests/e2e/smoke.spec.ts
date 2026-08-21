import { expect, test } from "@playwright/test";

test("marketing homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /build financial products without waiting for real bank access/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /join waitlist/i })).toBeVisible();
});

test("sandbox page loads", async ({ page }) => {
  await page.goto("/dashboard/sandbox");
  await expect(page).toHaveURL(/sign-in/);
});

test("marketing page is usable at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /build financial products/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /join waitlist/i })).toBeVisible();
});
