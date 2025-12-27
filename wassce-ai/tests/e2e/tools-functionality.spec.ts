import { expect, test } from "@playwright/test";

test.describe("Dashboard Tools Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/");
    await page.getByRole("button", { name: "Get Started" }).first().click();
    await page.getByPlaceholder("Full Name").fill("Test Learner");
    await page.getByPlaceholder("Email Address").fill("test@example.com");
    await page.getByPlaceholder("Create a password").fill("password123");
    await page.getByPlaceholder("Confirm your password").fill("password123");
    await page.getByRole("checkbox", { name: /By signing up/ }).check();
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL(/\/dashboard\/overview/);
    await page.goto("/dashboard/tools");
  });

  test("should switch between tools via tabs", async ({ page }) => {
    // Check that tool tabs are visible
    await expect(page.getByRole("button", { name: /^Flashcards$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Quizzes$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Notes$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Whiteboard$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Calculator$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^AI Chat$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Fun Break$/ })).toBeVisible();

    // Click on different tools and verify content changes
    await page.getByRole("button", { name: /^Quizzes$/ }).click();
    await expect(page.getByText("Launch subject-based quizzes")).toBeVisible();

    await page.getByRole("button", { name: /^Notes$/ }).click();
    await expect(page.getByText("Study Notes")).toBeVisible();

    await page.getByRole("button", { name: /^Calculator$/ }).click();
    await expect(page.getByText("Scientific Calculator")).toBeVisible();

    await page.getByRole("button", { name: /^AI Chat$/ }).click();
    await expect(page.getByText("Chat with AI Tutor")).toBeVisible();
  });

  test("should interact with Quizzes tool", async ({ page }) => {
    await page.getByRole("button", { name: /^Quizzes$/ }).click();

    // Start quiz
    await page.getByRole("button", { name: "Launch quiz" }).click();
    await expect(page.getByText("Question 1")).toBeVisible({ timeout: 20_000 });

    // Answer a question (sample or AI)
    const h2o = page.getByRole("button", { name: "H2O" });
    if (await h2o.isVisible()) {
      await h2o.click();
    } else {
      await page.getByTestId("quiz-option-0").click();
    }
    await page.getByRole("button", { name: "Submit Answer" }).click();
    await expect(page.getByText(/Correct!|Incorrect/)).toBeVisible();

    // Continue to next question
    await page.getByRole("button", { name: "Next Question" }).click();
    await expect(page.getByText("Question 2")).toBeVisible();
  });

  test("should interact with Notes tool", async ({ page }) => {
    await page.getByRole("button", { name: /^Notes$/ }).click();

    // Create a new note
    await page.getByRole("button", { name: "New Note" }).click();
    await page.getByPlaceholder("Note title").fill("Test Note");
    await page.getByPlaceholder("Note content").fill("This is a test note content");
    await page.getByRole("button", { name: "Add Note" }).click();

    // Verify note appears
    await expect(page.getByRole("heading", { name: "Test Note" })).toBeVisible();
    await expect(page.getByText("This is a test note content")).toBeVisible();

    // Delete the note
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Test Note")).not.toBeVisible();
  });

  test("should interact with Calculator tool", async ({ page }) => {
    await page.getByRole("button", { name: /^Calculator$/ }).click();

    // Perform calculation: 5 + 3 = 8
    await page.getByRole("button", { name: "5" }).click();
    await page.getByRole("button", { name: "+" }).click();
    await page.getByRole("button", { name: "3" }).click();
    await page.getByRole("button", { name: "=" }).click();

    // Check result
    const display = page.locator(".font-mono").first();
    await expect(display).toHaveText("8");
  });

  test("should interact with FunBreak tool", async ({ page }) => {
    await page.getByRole("button", { name: /^Fun Break$/ }).click();

    // Start memory game
    await page.getByText("Memory Match").click();
    await expect(page.getByRole("heading", { name: "memory" })).toBeVisible();

    // Check that cards are present
    const cards = page.locator("button").filter({ hasText: "?" });
    await expect(cards).toHaveCount(8);

    // End the break
    await page.getByRole("button", { name: "End Break" }).click();
    await expect(page.getByText("Fun Break Games")).toBeVisible();
  });

  test("should handle AI Chat without API key", async ({ page }) => {
    await page.getByRole("button", { name: /^AI Chat$/ }).click();

    const statusBadge = page.getByText(/API (Connected|Key Required)/);
    await expect(statusBadge).toBeVisible();

    const input = page.locator("textarea").first();

    if (await page.getByText("API Key Required").isVisible()) {
      await expect(page.getByText(/Add your OpenAI API key in Settings/)).toBeVisible();
      await expect(input).toBeDisabled();
    } else {
      await expect(page.getByText("API Connected")).toBeVisible();
      await expect(input).toBeEnabled();
    }
  });
});
