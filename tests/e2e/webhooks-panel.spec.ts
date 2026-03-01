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

test.describe("Webhooks Panel", () => {
  test("webhooks toggle opens webhooks panel", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("webhooks-toggle").click();
    await expect(page.getByTestId("webhooks-panel")).toBeVisible();
  });

  test("webhooks panel shows empty state", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("webhooks-toggle").click();
    await expect(page.getByText(/no webhooks configured/i)).toBeVisible();
  });
});
