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

test.describe("Locale Switching", () => {
  test("locale switcher is visible", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    const switcher = page.getByRole("button", { name: /language|langue|en|fr/i });
    await expect(switcher).toBeVisible();
  });

  test("title displays correctly in default locale", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await expect(page.getByText("OpenClaw Studio")).toBeVisible();
  });
});
