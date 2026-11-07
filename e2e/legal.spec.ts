import { expect, test } from "@playwright/test";

for (const [path, title] of [
  ["/privacy-policy", "Privacy Policy"],
  ["/terms", "Terms of Use"],
] as const) {
  test(`${title} loads without errors and fits a phone screen`, async ({ page }) => {
    const problems: string[] = [];
    page.on("pageerror", (error) => problems.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text());
    });

    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(path, { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(problems).toEqual([]);
  });
}

test("the footer reaches both legal pages from the home page", async ({ page }) => {
  await page.goto("/");
  await page.locator("footer").getByRole("link", { name: "Privacy Policy" }).click();
  await expect(page).toHaveURL(/\/privacy-policy$/);

  await page.locator("footer").getByRole("link", { name: "Terms" }).click();
  await expect(page).toHaveURL(/\/terms$/);
});

test("footer links return to home page sections from a legal page", async ({ page }) => {
  await page.goto("/terms");
  await page.locator("footer").getByRole("link", { name: "How it works" }).click();

  await expect(page).toHaveURL(/\/#how-it-works$/);
  await expect(page.locator("#how-it-works")).toBeVisible();
});

test("the contact form links to the Privacy Policy", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("form").getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
    "href",
    "/privacy-policy"
  );
});

test("the sitemap lists the legal pages", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();

  expect(sitemap).toContain("/privacy-policy</loc>");
  expect(sitemap).toContain("/terms</loc>");
});
