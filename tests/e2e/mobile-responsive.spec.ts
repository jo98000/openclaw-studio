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

test.describe("Mobile Responsive", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("renders correctly on iPhone viewport", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await expect(page.getByText("OpenClaw Studio")).toBeVisible();
    await expect(page.getByTestId("studio-menu-toggle")).toBeVisible();
  });

  test("menu opens on mobile viewport", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await expect(page.getByTestId("providers-toggle")).toBeVisible();
  });

  test("menu closes on escape key", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await expect(page.getByTestId("providers-toggle")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("providers-toggle")).not.toBeVisible();
  });
});
