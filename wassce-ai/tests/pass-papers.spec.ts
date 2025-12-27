import { test, expect } from '@playwright/test';

test('past paper list displays and filtering works', async ({ page }) => {
  await page.goto('http://localhost:5174');

  // Assume logged in, go to dashboard
  await expect(page.locator('text=Past Papers Review')).toBeVisible();

  // Check filters
  await expect(page.locator('select').first()).toContainText('All Subjects');
  await expect(page.locator('select').nth(1)).toContainText('All Types');

  // Check papers displayed
  await expect(page.locator('text=WASSCE Mathematics 2021 Objective Questions and Answers')).toBeVisible();
});

test('view PDF for past paper', async ({ page }) => {
  await page.goto('http://localhost:5174');

  // Click view on math paper
  await page.locator('text=WASSCE Mathematics 2021 Objective Questions and Answers').locator('..').locator('button').click();

  // Check PDF viewer
  await expect(page.locator('text=WASSCE Mathematics 2021 Objective Questions and Answers')).toBeVisible();
  await expect(page.locator('iframe')).toBeVisible();

  // Check open in new tab button
  await expect(page.locator('text=Open in New Tab')).toBeVisible();
});