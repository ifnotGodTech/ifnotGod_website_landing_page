import { expect, test } from "@playwright/test";

const GROUPS = ["Everyday automations", "Social and content", "AI agents"];

for (const [label, width] of [
  ["mobile", 320],
  ["tablet", 768],
  ["desktop", 1280],
] as const) {
  test(`services fits at ${label} width`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/services");

    for (const name of GROUPS) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("loads without errors, and its calls to action work", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });

  await page.goto("/services", { waitUntil: "networkidle" });
  expect(problems).toEqual([]);

  await page.locator("main").getByRole("link", { name: "See plans and prices" }).click();
  await expect(page).toHaveURL(/\/pricing$/);

  await page.goto("/services");
  await page.locator("main").getByRole("link", { name: "Book a free automation audit" }).click();
  await expect(page).toHaveURL(/\/audit$/);
});

test("the AI agents section has readable headings on its maroon background", async ({ page }) => {
  await page.goto("/services");

  await expect(page.getByRole("heading", { level: 2, name: "AI agents" })).toHaveCSS("color", "rgb(247, 241, 236)");
  await expect(page.getByRole("heading", { level: 3, name: "AI call agent" })).toHaveCSS("color", "rgb(247, 241, 236)");
});

test("the floating button stays off the hero, then appears", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto("/services");
  await expect(page.getByTestId("floating-cta")).toBeHidden();

  await page.getByRole("heading", { level: 2, name: "AI agents" }).scrollIntoViewIfNeeded();
  await expect(page.getByTestId("floating-cta")).toBeVisible();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("all services are visible", async ({ page }) => {
    await page.goto("/services");

    for (const name of GROUPS) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
    await expect(page.getByRole("heading", { level: 3, name: "AI call agent" })).toBeVisible();
  });
});
