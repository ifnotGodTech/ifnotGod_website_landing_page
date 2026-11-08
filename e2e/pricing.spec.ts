import { expect, test } from "@playwright/test";

const panelHeading = (name: string) => `What's in ${name}`;

for (const [label, width] of [
  ["mobile", 320],
  ["tablet", 768],
  ["desktop", 1280],
] as const) {
  test(`pricing fits at ${label} width, for every plan`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/pricing");

    for (const name of ["Starter", "Growth", "Pro", "Custom"]) {
      await page.getByRole("button", { name: new RegExp(name) }).click();
      await expect(page.getByRole("heading", { level: 2, name: panelHeading(name) })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }

    const pricesOutsideButtons = await page.getByTestId("plan-option-price").evaluateAll((prices) =>
      prices
        .filter((price) => price.getBoundingClientRect().right > price.closest("button")!.getBoundingClientRect().right)
        .map((price) => price.textContent)
    );
    expect(pricesOutsideButtons).toEqual([]);
  });
}

test("loads without errors, with Growth selected first", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });

  await page.goto("/pricing", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Plans that do the work for you.");
  await expect(page.getByRole("button", { name: /Growth/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { level: 2, name: panelHeading("Growth") })).toBeVisible();
  expect(problems).toEqual([]);
});

test("a home page plan card opens pricing with that plan selected", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "See everything in Pro" }).click();

  await expect(page).toHaveURL(/\/pricing\?plan=pro$/);
  await expect(page.getByRole("button", { name: /Pro/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { level: 2, name: panelHeading("Pro") })).toBeVisible();
});

test("an unknown plan in the link falls back to Growth", async ({ page }) => {
  await page.goto("/pricing?plan=platinum");

  await expect(page.getByRole("button", { name: /Growth/ })).toHaveAttribute("aria-pressed", "true");
});

test("choosing a plan shows only that plan's details", async ({ page }) => {
  await page.goto("/pricing");

  await page.getByRole("button", { name: /Starter/ }).click();

  await expect(page.getByRole("heading", { level: 2, name: panelHeading("Starter") })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: panelHeading("Growth") })).toBeHidden();
  await expect(page.getByText("WhatsApp sales agent").locator("visible=true")).toHaveCount(0);
});

test("the keyboard can reach and choose a plan, with a visible focus ring", async ({ page }) => {
  await page.goto("/pricing");

  const pro = page.getByRole("button", { name: /Pro/ });
  await page.getByRole("button", { name: /Growth/ }).focus();
  await page.keyboard.press("Tab");
  await expect(pro).toBeFocused();
  await expect(pro).toHaveCSS("outline-color", "rgb(107, 31, 42)");

  await page.keyboard.press("Enter");
  await expect(pro).toHaveAttribute("aria-pressed", "true");
});

test("a plan's button goes to the audit with that plan", async ({ page }) => {
  await page.goto("/pricing");

  await page.getByRole("link", { name: "Start with an audit: Growth" }).click();

  await expect(page).toHaveURL(/\/audit\?plan=growth$/);
});

test("questions open and close without scripts doing the work", async ({ page }) => {
  await page.goto("/pricing");

  await page.getByText("Do I need to understand the technology?").click();

  await expect(page.getByText("We choose the tools")).toBeVisible();
});

test("the floating button stays off the hero, then appears", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByTestId("floating-cta")).toBeHidden();

  await page.getByRole("heading", { name: "Plan terms" }).scrollIntoViewIfNeeded();
  await expect(page.getByTestId("floating-cta")).toBeVisible();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("every plan's details are visible", async ({ page }) => {
    await page.goto("/pricing");

    for (const name of ["Starter", "Growth", "Pro", "Custom"]) {
      await expect(page.getByRole("heading", { level: 2, name: panelHeading(name) })).toBeVisible();
    }
    await expect(page.getByText("₦80,000 / month")).toBeVisible();
    await expect(page.getByText("AI call agent").first()).toBeVisible();
  });
});

test("the server sends every plan's details, for search engines", async ({ request }) => {
  const html = await (await request.get("/pricing")).text();

  for (const text of ["Landing or link-in-bio page", "Document reader", "Larger apps and platforms"]) {
    expect(html).toContain(text);
  }
  expect(html).not.toContain("noindex");
});
