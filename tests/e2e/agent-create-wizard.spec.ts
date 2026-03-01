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

test.describe("Agent Create Wizard", () => {
  test("new agent button is visible on disconnected screen", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await expect(page.getByTestId("studio-menu-toggle")).toBeVisible();
  });

  test("studio menu opens and shows all entries", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await expect(page.getByTestId("providers-toggle")).toBeVisible();
    await expect(page.getByTestId("channels-toggle")).toBeVisible();
    await expect(page.getByTestId("routing-toggle")).toBeVisible();
    await expect(page.getByTestId("webhooks-toggle")).toBeVisible();
    await expect(page.getByTestId("skills-toggle")).toBeVisible();
    await expect(page.getByTestId("analytics-toggle")).toBeVisible();
    await expect(page.getByTestId("logs-toggle")).toBeVisible();
  });
});
