import { expect, test } from "@playwright/test";

const demoName = "Test Learner";

test("landing login flow and topic spotlight interactions", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Get Started" }).first().click();

  await page.getByPlaceholder("Full Name").fill(demoName);
  await page.getByPlaceholder("Email Address").fill("test@example.com");
  await page.getByPlaceholder("Create a password").fill("password123");
  await page.getByPlaceholder("Confirm your password").fill("password123");
  await page.getByRole("checkbox", { name: /By signing up/ }).check();

  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL(/\/dashboard\/overview/);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const examDate = tomorrow.toISOString().split("T")[0];

  await page.getByRole("checkbox", { name: "Mathematics" }).check();
  await page.locator('input[type="date"]').fill(examDate);
  await page.getByRole("button", { name: "Save profile" }).click();

  await page.getByRole("button", { name: "Show insights" }).click();
  const spotlightHeading = page.getByRole("heading", { name: "Interactive mastery view" });
  await expect(spotlightHeading).toBeVisible();
  const spotlightSection = spotlightHeading.locator("xpath=ancestor::section[1]");

  const slider = page.getByLabel("Adjust focus boost");
  await slider.focus();
  for (let i = 0; i < 4; i += 1) {
    await slider.press("ArrowRight");
  }

  const predictedValue = spotlightSection.locator('p:has-text("Predicted mastery") strong');
  await expect(predictedValue).toHaveText("94%");

  const shiftButton = spotlightSection.getByRole("button", { name: /Shift focus to/ });
  await shiftButton.click();

  const masteryBadge = spotlightSection.locator("p.text-4xl");
  await expect(masteryBadge).toHaveText("68%");
  await expect(page.getByRole("button", { name: /Shift focus to Chemistry/ })).toBeVisible();
});
