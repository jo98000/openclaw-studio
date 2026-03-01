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

test.describe("Provider Configuration", () => {
  test("providers toggle opens providers panel", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("providers-toggle").click();
    await expect(page.getByTestId("providers-panel")).toBeVisible();
  });

  test("providers panel has search input", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("providers-toggle").click();
    await expect(page.getByPlaceholder(/search providers/i)).toBeVisible();
  });
});
