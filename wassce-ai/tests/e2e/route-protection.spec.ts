import { expect, test } from "@playwright/test";

/**
 * Route protection & public navigation smoke tests.
 * Run with: npm run test:e2e (starts the dev server automatically).
 */

test.describe("Protected routes", () => {
  test("unauthenticated visit to /dashboard redirects to sign in", async ({ page }) => {
    await page.goto("/dashboard/overview");
    await page.waitForURL(/\/auth\/signin/);
    expect(page.url()).toContain("/auth/signin");
  });

  test("deep protected route also redirects to sign in", async ({ page }) => {
    await page.goto("/dashboard/billing");
    await page.waitForURL(/\/auth\/signin/);
    expect(page.url()).toContain("/auth/signin");
  });
});

test.describe("Public routes load", () => {
  for (const path of ["/", "/pricing", "/about", "/faq", "/help", "/legal/terms", "/legal/privacy"]) {
    test(`GET ${path} renders without crashing`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      // The error boundary fallback must not be visible on a healthy page.
      await expect(page.getByText("Something went wrong")).toHaveCount(0);
    });
  }

  test("unknown route shows the NotFound page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });
});
