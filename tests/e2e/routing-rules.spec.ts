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

test.describe("Routing Rules", () => {
  test("routing toggle opens routing panel", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("routing-toggle").click();
    await expect(page.getByTestId("routing-panel")).toBeVisible();
  });

  test("routing panel shows empty state when no rules", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("routing-toggle").click();
    await expect(page.getByText(/no routing rules/i)).toBeVisible();
  });
});
