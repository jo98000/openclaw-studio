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

test.describe("Analytics Dashboard", () => {
  test("analytics toggle opens analytics dashboard", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("analytics-toggle").click();
    await expect(page.getByTestId("analytics-dashboard")).toBeVisible();
  });

  test("analytics dashboard shows time range selector", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("analytics-toggle").click();
    await expect(page.getByText("24h")).toBeVisible();
    await expect(page.getByText("7d")).toBeVisible();
    await expect(page.getByText("30d")).toBeVisible();
  });
});
