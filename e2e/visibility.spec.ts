import { expect, test, type Page } from "@playwright/test";

const CONTENT = "h1, h2, p, li, form";

// Scroll each content block to the middle of the screen, because fades depend on
// scroll position, and return any block that still isn't fully visible.
function findHiddenContent(page: Page) {
  return page.evaluate(async (selector) => {
    document.documentElement.style.scrollBehavior = "auto";
    const hidden: string[] = [];

    for (const element of document.querySelectorAll(selector)) {
      element.scrollIntoView({ block: "center" });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      for (let node: Element | null = element; node && node !== document.body; node = node.parentElement) {
        if (Number(getComputedStyle(node).opacity) < 0.99) {
          hidden.push((element.textContent ?? "").trim().slice(0, 40));
          break;
        }
      }
    }
    return hidden;
  }, CONTENT);
}

test.describe("content stays visible", () => {
  test("in a normal visit", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCSS("opacity", "1");
    expect(await findHiddenContent(page)).toEqual([]);
  });

  test("with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCSS("opacity", "1");
    expect(await findHiddenContent(page)).toEqual([]);
  });

  test("when printing", async ({ page }) => {
    await page.emulateMedia({ media: "print" });
    await page.goto("/");
    await expect(page.locator("form")).toHaveCSS("opacity", "1");
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("the headline and form are in the page", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("#contact form")).toBeAttached();
    });
  });

  test("the server HTML doesn't start content hidden", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).not.toMatch(/opacity:\s*0/);
  });
});

test("security policy doesn't block the page", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });

  await page.goto("/", { waitUntil: "networkidle" });

  expect(problems).toEqual([]);
});
