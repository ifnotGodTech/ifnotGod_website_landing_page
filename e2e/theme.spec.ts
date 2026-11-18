import { expect, test } from "@playwright/test";

const rgb = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
};

test.describe("heading colours", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/terms");
    await page.locator("main").evaluate((main) => {
      main.insertAdjacentHTML(
        "afterbegin",
        `<section class="surface-light">
           <h2 id="on-light">Light section heading</h2>
           <a id="light-link" href="/terms">Link</a>
         </section>
         <h2 id="utility" class="text-orange">Heading with a colour class</h2>`
      );
    });
  });

  test("headings are readable on light sections", async ({ page }) => {
    await expect(page.locator("#on-light")).toHaveCSS("color", rgb("#1b1210"));
    await expect(page.locator(".surface-light")).toHaveCSS("background-color", rgb("#f7f1ec"));
  });

  test("colour classes can override a heading's colour", async ({ page }) => {
    await expect(page.locator("#utility")).toHaveCSS("color", rgb("#e07b2a"));
  });

  test("headings on dark sections keep their usual colour", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCSS("color", rgb("#f7f1ec"));
  });

  test("the focus ring is maroon on light sections, because orange fails contrast there", async ({ page }) => {
    await page.locator("#light-link").focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");

    await expect(page.locator("#light-link")).toHaveCSS("outline-color", rgb("#6b1f2a"));
  });
});
