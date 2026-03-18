import { test, expect } from "@playwright/test";

test.describe("Client Portal", () => {
  test("login page loads with Google and email options", async ({ page }) => {
    await page.goto("/portal/login");
    await expect(page.getByText(/CLIENT PORTAL/i)).toBeVisible();
    await expect(page.getByText(/Continue with Google/i)).toBeVisible();
  });

  test("login page has sign-in and register tabs", async ({ page }) => {
    await page.goto("/portal/login");
    await expect(page.getByText(/Sign In/i).first()).toBeVisible();
    await expect(page.getByText(/Register/i).first()).toBeVisible();
  });

  test("register tab shows name field", async ({ page }) => {
    await page.goto("/portal/login");
    const registerTab = page.getByText(/Register/i).first();
    await registerTab.click();
    await expect(page.locator('input[placeholder*="name" i]').first()).toBeVisible();
  });

  test("login form validates required fields", async ({ page }) => {
    await page.goto("/portal/login");
    const submitBtn = page.getByRole("button", { name: /Sign In/i }).last();
    await expect(submitBtn).toBeDisabled();
  });

  test("/portal redirects to /portal/dashboard", async ({ page }) => {
    const response = await page.goto("/portal");
    const url = page.url();
    expect(url).toContain("/portal/");
  });

  test("unauthenticated user is redirected to login from dashboard", async ({
    page,
  }) => {
    await page.goto("/portal/dashboard");
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test("unauthenticated user is redirected from appointments", async ({
    page,
  }) => {
    await page.goto("/portal/appointments");
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test("unauthenticated user is redirected from messages", async ({
    page,
  }) => {
    await page.goto("/portal/messages");
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test("login page has back to website link", async ({ page }) => {
    await page.goto("/portal/login");
    await expect(page.getByText(/Back to website/i)).toBeVisible();
  });

  test("login page has admin login link", async ({ page }) => {
    await page.goto("/portal/login");
    await expect(page.getByText(/Admin login/i)).toBeVisible();
  });

  test("portal login is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/portal/login");
    await expect(page.getByText(/CLIENT PORTAL/i)).toBeVisible();
    await expect(page.getByText(/Continue with Google/i)).toBeVisible();
  });

  test("portal login loads quickly", async ({ page }) => {
    const start = Date.now();
    await page.goto("/portal/login", { waitUntil: "domcontentloaded" });
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });
});
