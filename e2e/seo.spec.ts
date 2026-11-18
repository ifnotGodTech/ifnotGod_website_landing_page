import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", title: "AI Automation for Businesses in Nigeria | IFNOTGOD TECH LTD" },
  { path: "/services", title: "Business Automation Services in Nigeria | IFNOTGOD TECH LTD" },
  { path: "/pricing", title: "Automation Plans and Prices | IFNOTGOD TECH LTD" },
  { path: "/audit", title: "Book a Free Automation Audit | IFNOTGOD TECH LTD" },
  { path: "/privacy-policy", title: "Privacy Policy | IFNOTGOD TECH LTD" },
  { path: "/terms", title: "Terms of Use | IFNOTGOD TECH LTD" },
];

const meta = (property: string) => `meta[property="${property}"], meta[name="${property}"]`;

for (const { path, title } of PAGES) {
  test(`${path} has its own title, description, canonical URL and sharing details`, async ({ page }) => {
    await page.goto(path);

    await expect(page).toHaveTitle(title);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(new URL(canonical!).pathname).toBe(path);
    await expect(page.locator(meta("description"))).toHaveAttribute("content", /.{50,}/);
    await expect(page.locator(meta("og:title"))).toHaveAttribute("content", title);
    await expect(page.locator(meta("og:url"))).toHaveAttribute("content", new RegExp(`${path === "/" ? "/?" : path}$`));
    await expect(page.locator(meta("og:image")).first()).toHaveAttribute("content", /\/opengraph-image\.png$/);
    await expect(page.locator(meta("og:image:alt")).first()).toHaveAttribute("content", /Every Problem Has a Tech Solution/);
    await expect(page.locator(meta("twitter:image")).first()).toHaveAttribute("content", /\/opengraph-image\.png$/);
    await expect(page.locator(meta("twitter:card"))).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator(meta("robots"))).not.toHaveAttribute("content", /noindex/);
  });

  test(`${path} loads without errors or blocked resources`, async ({ page }) => {
    const problems: string[] = [];
    page.on("pageerror", (error) => problems.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text());
    });

    await page.goto(path, { waitUntil: "networkidle" });

    expect(problems).toEqual([]);
  });
}

test("the main pages' titles say what we do and where", async ({ page }) => {
  for (const path of ["/", "/services"]) {
    await page.goto(path);
    await expect(page).toHaveTitle(/Automation.*Nigeria/);
  }
});

test("every page has a different description", async ({ page }) => {
  const descriptions = new Set<string>();
  for (const { path } of PAGES) {
    await page.goto(path);
    descriptions.add((await page.locator(meta("description")).getAttribute("content"))!);
  }

  expect(descriptions.size).toBe(PAGES.length);
});

test("a missing page doesn't claim to be the home page", async ({ page }) => {
  const response = await page.goto("/no-such-page");

  expect(response?.status()).toBe(404);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test("the sitemap lists every public page", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();

  for (const { path } of PAGES.filter((item) => item.path !== "/")) {
    expect(sitemap).toContain(`${path}</loc>`);
  }
});

test("the sharing image is served", async ({ request }) => {
  const response = await request.get("/opengraph-image.png");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});

test("the pricing page describes its priced plans for search engines", async ({ page }) => {
  await page.goto("/pricing");

  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const service = blocks.map((block) => JSON.parse(block)).find((data) => data["@type"] === "Service");

  expect(service.offers.map((offer: { name: string; price: number }) => [offer.name, offer.price])).toEqual([
    ["Starter", 20_000],
    ["Growth", 40_000],
    ["Pro", 80_000],
  ]);
});
