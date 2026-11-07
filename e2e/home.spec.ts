import { expect, test } from "@playwright/test";

const SECTION_HEADINGS = [
  "You tell us the task that wastes your time. We handle the rest.",
  "Which of these sounds like your week?",
  "One monthly fee. We do the work.",
  "We build bigger things too.",
  "What's the task wasting your time?",
];

for (const [name, width] of [
  ["mobile", 320],
  ["tablet", 768],
  ["desktop", 1280],
] as const) {
  test(`the home page shows every section at ${name} width, with nothing cut off`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const heading of SECTION_HEADINGS) {
      await expect(page.getByRole("heading", { level: 2, name: heading })).toBeAttached();
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll("main a")]
        .filter((link) => {
          const box = link.getBoundingClientRect();
          return box.left < 0 || box.right > window.innerWidth;
        })
        .map((link) => link.textContent)
    );
    expect(clipped).toEqual([]);
  });
}

test("the old home page sections are gone", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Tell Us Your Challenge")).toHaveCount(0);
  await expect(page.locator("#solutions, #contact, #why-us")).toHaveCount(0);
});

test("the main buttons reach the audit and pricing pages", async ({ page }) => {
  await page.goto("/");

  await page.locator("[data-page-hero]").getByRole("link", { name: "See plans and prices" }).click();
  await expect(page).toHaveURL(/\/pricing$/);

  await page.goto("/");
  await page.locator("main").getByRole("link", { name: "Start with an audit: Growth" }).click();
  await expect(page).toHaveURL(/\/audit\?plan=growth$/);
  await expect(page.locator("#contact form")).toBeVisible();
});

test.describe("plan section", () => {
  for (const width of [320, 640, 1280, 1440]) {
    test(`prices fit inside their cards at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");

      const overflowing = await page.getByTestId("plan-price").evaluateAll((prices) =>
        prices.filter((price) => price.scrollWidth > price.clientWidth).map((price) => price.textContent)
      );

      expect(overflowing).toEqual([]);
    });
  }

  test("is readable on its light background", async ({ page }) => {
    await page.goto("/");

    const section = page.locator(".surface-light");
    await expect(section).toHaveCSS("background-color", "rgb(247, 241, 236)");
    await expect(section.getByRole("heading", { level: 2 })).toHaveCSS("color", "rgb(27, 18, 16)");
    await expect(section.getByRole("heading", { level: 3, name: "Starter" })).toHaveCSS("color", "rgb(27, 18, 16)");
    await expect(section.getByRole("heading", { level: 3, name: "Growth" })).toHaveCSS("color", "rgb(247, 241, 236)");
    await expect(section.getByRole("heading", { level: 3, name: "Custom" })).toHaveCSS("color", "rgb(247, 241, 236)");
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("all sections and plan prices are in the page", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const heading of SECTION_HEADINGS) {
      await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
    }
    await expect(page.getByText("₦40,000")).toBeVisible();
  });
});
