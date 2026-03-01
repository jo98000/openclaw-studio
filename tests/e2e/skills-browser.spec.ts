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

test.describe("Skills Browser", () => {
  test("skills toggle opens skills browser", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("skills-toggle").click();
    await expect(page.getByTestId("skills-browser")).toBeVisible();
  });

  test("skills browser shows search and category filters", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("skills-toggle").click();
    await expect(page.getByPlaceholder(/search skills/i)).toBeVisible();
    await expect(page.getByText("All")).toBeVisible();
    await expect(page.getByText("Communication")).toBeVisible();
  });

  test("skills browser shows skill cards", async ({ page }) => {
    await stubStudioApi(page);
    await page.goto("/");
    await page.getByTestId("studio-menu-toggle").click();
    await page.getByTestId("skills-toggle").click();
    await expect(page.getByTestId("skill-card-email-sender")).toBeVisible();
    await expect(page.getByTestId("skill-card-web-scraper")).toBeVisible();
  });
});
