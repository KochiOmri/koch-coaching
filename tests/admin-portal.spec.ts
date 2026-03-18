import { test, expect } from "@playwright/test";

test.describe("Admin Portal", () => {
  test("login page loads with Google sign-in button", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByText(/KOCH ADMIN/i)).toBeVisible();
    await expect(page.getByText(/Sign in with Google/i)).toBeVisible();
  });

  test("login page has password fallback option", async ({ page }) => {
    await page.goto("/admin/login");
    const passwordToggle = page.getByText(/Sign in with password/i);
    await expect(passwordToggle).toBeVisible();
    await passwordToggle.click();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("login page has back to website link", async ({ page }) => {
    await page.goto("/admin/login");
    const backLink = page.getByText(/Back to website/i);
    await expect(backLink).toBeVisible();
  });

  test("unauthenticated user cannot access dashboard", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login page shows error on failed authentication", async ({ page }) => {
    await page.goto("/admin/login?error=exchange_failed");
    await expect(page.getByText(/failed|error/i)).toBeVisible();
  });

  test("admin login page loads quickly", async ({ page }) => {
    const start = Date.now();
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });

  test("admin login is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/admin/login");
    await expect(page.getByText(/Sign in with Google/i)).toBeVisible();
    const googleBtn = page.getByText(/Sign in with Google/i);
    const box = await googleBtn.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(375);
  });
});

test.describe("Admin Portal - Legacy Password Auth", () => {
  test("wrong password shows error message", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByText(/Sign in with password/i).click();
    await page.waitForTimeout(500);
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    await expect(page.getByText(/invalid|error|wrong/i).first()).toBeVisible();
  });
});
