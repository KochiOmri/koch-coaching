import { test, expect } from "@playwright/test";

test.describe("Cross-Portal Navigation", () => {
  test("landing page → admin login", async ({ page }) => {
    await page.goto("/");
    await page.goto("/admin/login");
    await expect(page.getByText(/KOCH ADMIN/i)).toBeVisible();
  });

  test("landing page → portal login", async ({ page }) => {
    await page.goto("/");
    await page.goto("/portal/login");
    await expect(page.getByText(/CLIENT PORTAL/i)).toBeVisible();
  });

  test("admin login → back to website", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByText(/Back to website/i).click();
    await expect(page).toHaveURL("/");
  });

  test("portal login → back to website", async ({ page }) => {
    await page.goto("/portal/login");
    await page.getByText(/Back to website/i).click();
    await expect(page).toHaveURL("/");
  });

  test("portal login → admin login link works", async ({ page }) => {
    await page.goto("/portal/login");
    await page.getByText(/Admin login/i).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("Public Pages", () => {
  test("classes page loads", async ({ page }) => {
    await page.goto("/classes");
    await expect(page.locator("body")).toBeVisible();
  });

  test("intake page loads", async ({ page }) => {
    await page.goto("/intake");
    await expect(page.locator("body")).toBeVisible();
  });

  test("blog page loads", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("body")).toBeVisible();
  });

  test("404 for non-existent page", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res!.status()).toBe(404);
  });
});

test.describe("Mobile Navigation", () => {
  test("landing page loads on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const res = await page.goto("/");
    expect(res!.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("portal login is usable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/portal/login");
    await expect(page.getByText(/Continue with Google/i)).toBeVisible();

    const googleBtn = page.getByText(/Continue with Google/i);
    const box = await googleBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(200);
  });

  test("admin login is usable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/admin/login");
    await expect(page.getByText(/Sign in with Google/i)).toBeVisible();
  });
});
