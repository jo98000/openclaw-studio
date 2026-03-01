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

test.describe("Channels Panel", () => {
  test("channels toggle opens channels panel", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("channels-toggle").click();
    await expect(page.getByTestId("channels-panel")).toBeVisible();
  });

  test("channels panel shows search input", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("channels-toggle").click();
    await expect(page.getByPlaceholder(/search channels/i)).toBeVisible();
  });

  test("channels panel shows channel cards", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("channels-toggle").click();
    await expect(page.getByTestId("channel-card-whatsapp")).toBeVisible();
    await expect(page.getByTestId("channel-card-telegram")).toBeVisible();
  });
});
