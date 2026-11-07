import { expect, test, type Page } from "@playwright/test";

const PAGES = ["/", "/privacy-policy", "/terms"];
const WIDTHS = [
  ["mobile", 375],
  ["tablet", 768],
  ["desktop", 1280],
] as const;

const floatingCta = (page: Page) => page.getByTestId("floating-cta");

// Controls that sit in the viewport must not be cut off at its edges.
function clippedControls(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("nav a, nav button, [data-testid='floating-cta'] a")]
      .filter((element) => {
        const box = element.getBoundingClientRect();
        const shown = getComputedStyle(element).visibility !== "hidden" && box.width > 0;
        return shown && (box.left < 0 || box.right > window.innerWidth);
      })
      .map((element) => element.textContent)
  );
}

for (const [name, width] of WIDTHS) {
  test.describe(`at ${name} width`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const path of PAGES) {
      test(`${path} has one shared layout, with no overflow or clipped controls`, async ({ page }) => {
        await page.goto(path);

        await expect(page.locator("nav").first()).toBeVisible();
        await expect(page.locator("main")).toHaveCount(1);
        await expect(page.locator("footer")).toHaveCount(1);
        await expect(floatingCta(page)).toHaveCount(1);

        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        expect(await clippedControls(page)).toEqual([]);
      });
    }

    test("the fixed navigation doesn't cover the legal page heading", async ({ page }) => {
      await page.goto("/terms");

      const nav = await page.locator("nav").first().boundingBox();
      const heading = await page.locator("h1").boundingBox();

      expect(heading!.y).toBeGreaterThanOrEqual(nav!.y + nav!.height);
    });
  });
}

test("legal pages drop their old separate header", async ({ page }) => {
  await page.goto("/terms");

  await expect(page.getByRole("link", { name: "Back to home" })).toHaveCount(0);
  await expect(page.locator("header")).toHaveCount(0);
});

test("the desktop navigation returns to a home page section from another page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/terms");

  await page.locator("nav").first().getByRole("link", { name: "How it works" }).click();

  await expect(page).toHaveURL(/\/#how-it-works$/);
  await expect(page.locator("#how-it-works")).toBeInViewport();
});

test("each main navigation link reaches its page without errors", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });

  for (const [name, url] of [
    ["Services", /\/services$/],
    ["Pricing", /\/pricing$/],
    ["Book a free audit", /\/audit$/],
  ] as const) {
    await page.locator("nav").first().getByRole("link", { name }).click();
    await expect(page).toHaveURL(url);
    await expect(page.locator("h1")).toBeVisible();
  }

  expect(problems).toEqual([]);
});

test("the mobile menu opens, navigates and closes", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/terms");

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.locator("#mobile-menu").getByRole("link", { name: "About" }).click();

  await expect(page).toHaveURL(/\/#about$/);
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#about")).toBeInViewport();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  expect(await page.locator("main").evaluate((main: HTMLElement) => main.inert)).toBe(false);
});

test("the back button closes an open mobile menu", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await page.locator("footer").getByRole("link", { name: "Terms" }).click();
  await expect(page).toHaveURL(/\/terms$/);

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.goBack();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test.describe("floating button", () => {
  test("hides over the hero and footer, and shows between them", async ({ page }) => {
    await page.goto("/");
    await expect(floatingCta(page)).toBeHidden();

    await page.locator("#solutions").scrollIntoViewIfNeeded();
    await expect(floatingCta(page)).toBeVisible();

    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(floatingCta(page)).toBeHidden();
  });

  test("keeps working as the visitor moves between pages", async ({ page }) => {
    await page.goto("/");
    await page.locator("#solutions").scrollIntoViewIfNeeded();
    await expect(floatingCta(page)).toBeVisible();

    // The new page's hero is what hides it.
    await page.locator("nav").first().getByRole("link", { name: "Services" }).click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(floatingCta(page)).toBeHidden();

    // Back on the home page, it watches the home page's areas again.
    await page.locator("nav").first().getByRole("link").first().click();
    await expect(page).toHaveURL(/\/$/);
    await page.locator("#solutions").scrollIntoViewIfNeeded();
    await expect(floatingCta(page)).toBeVisible();
  });

  for (const path of ["/privacy-policy", "/terms"]) {
    test(`stays hidden while reading ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();

      await page.locator("h2").nth(1).scrollIntoViewIfNeeded();

      await expect(floatingCta(page)).toBeHidden();
    });
  }

  test("takes the visitor to the audit page, and stays hidden there", async ({ page }) => {
    await page.goto("/");
    await page.locator("#solutions").scrollIntoViewIfNeeded();

    await floatingCta(page).getByRole("link", { name: "Book a free audit" }).click();

    await expect(page).toHaveURL(/\/audit$/);
    await expect(floatingCta(page)).toBeHidden();
  });
});

test("changing page starts at the top without a visible scroll", async ({ page }) => {
  await page.goto("/");
  await page.locator("footer").scrollIntoViewIfNeeded();

  await page.locator("footer").getByRole("link", { name: "Terms" }).click();
  await expect(page).toHaveURL(/\/terms$/);

  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});
