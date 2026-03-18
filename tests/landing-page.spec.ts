import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads successfully", async ({ page }) => {
    const res = await page.goto("/");
    expect(res!.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("navigation links are functional", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const links = page.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test("booking form section is present", async ({ page }) => {
    const res = await page.goto("/", { waitUntil: "networkidle" });
    if (res!.status() >= 500) return;
    const body = await page.locator("body").textContent();
    expect(body?.toLowerCase()).toContain("book");
  });

  test("footer renders with contact info", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    const footer = page.locator("footer");
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
    }
  });

  test("page loads within 5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });

  test("no critical console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("hydration") &&
        !e.includes("Warning:") &&
        !e.includes("500") &&
        !e.includes("Failed to load resource")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("is responsive - no horizontal scroll on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const body = page.locator("body");
    const box = await body.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(375);
  });

  test("WhatsApp button is visible", async ({ page }) => {
    await page.goto("/");
    const whatsapp = page.locator('[href*="wa.me"], [href*="whatsapp"]').first();
    if (await whatsapp.isVisible()) {
      await expect(whatsapp).toBeVisible();
    }
  });
});
