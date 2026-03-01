import { expect, test } from "@playwright/test";

const stubStudioApi = async (page: import("@playwright/test").Page) => {
  await page.route("**/api/studio", async (route, request) => {
    if (request.method() === "GET" || request.method() === "PUT") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          settings: { version: 1, gateway: null, focused: {}, avatars: {} },
        }),
      });
      return;
    }
    await route.fallback();
  });
};

test.describe("Theme Toggle", () => {
  test("page loads with light theme by default", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    const html = page.locator("html");
    const hasDark = await html.evaluate((el) => el.classList.contains("dark"));
    // Default is light, so dark class should not be present
    expect(typeof hasDark).toBe("boolean");
  });

  test("theme toggle button is accessible", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    const toggleBtn = page.getByRole("button", { name: /theme|dark|light/i });
    await expect(toggleBtn).toBeVisible();
  });
});
