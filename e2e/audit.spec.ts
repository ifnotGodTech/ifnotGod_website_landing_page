import { expect, test, type Page } from "@playwright/test";
import { latestEmailWithSubject } from "./backend";

const form = (page: Page) => page.getByRole("form", { name: "Book your free audit" });
const planField = (page: Page) => page.getByLabel("Interested in a plan? (optional)");

for (const [label, width] of [
  ["mobile", 320],
  ["tablet", 768],
  ["desktop", 1280],
] as const) {
  test(`the audit page fits at ${label} width`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/audit");

    await expect(form(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("loads without errors", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });

  await page.goto("/audit", { waitUntil: "networkidle" });

  expect(problems).toEqual([]);
});

test("a plan's button on the pricing page preselects that plan", async ({ page }) => {
  await page.goto("/pricing");
  await page.getByRole("button", { name: /Pro/ }).click();
  await page.getByRole("link", { name: "Start with an audit: Pro" }).click();

  await expect(page).toHaveURL(/\/audit\?plan=pro$/);
  await expect(planField(page)).toHaveValue("pro");
});

test("shows errors without sending anything, and keeps what was typed", async ({ page }) => {
  let sent = false;
  await page.route("**/api/contact", (route) => {
    sent = true;
    return route.abort();
  });
  await page.goto("/audit");

  await page.getByLabel("Email").fill("ada@obilogistics.com");
  await page.getByRole("button", { name: "Book my free audit" }).click();

  await expect(page.getByText("Enter your full name.")).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeFocused();
  await expect(page.getByLabel("Email")).toHaveValue("ada@obilogistics.com");
  expect(sent).toBe(false);
});

// The request is answered here, so no real email is ever sent.
test("sends the request with the chosen plan, and confirms it", async ({ page }) => {
  let body: Record<string, unknown> = {};
  await page.route("**/api/contact", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto("/audit?plan=growth");

  await page.getByLabel("Full name").fill("Ada Obi");
  await page.getByLabel("Email").fill("ada@obilogistics.com");
  await page.getByLabel("What task or problem is wasting your time?").fill("We confirm every delivery by phone.");
  await page.getByRole("button", { name: "Book my free audit" }).click();

  await expect(page.getByText(/we've got your request/i)).toBeVisible();
  expect(body).toMatchObject({ fullName: "Ada Obi", plan: "growth" });
});

test("a real request is saved by the backend and emailed to the team", async ({ page }) => {
  const name = `Audit Tester ${Date.now()}`;
  await page.goto("/audit?plan=pro");

  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email").fill("tester@example.com");
  await page.getByLabel("What task or problem is wasting your time?").fill("We confirm every delivery by phone.");
  await page.getByRole("button", { name: "Book my free audit" }).click();

  await expect(page.getByText(/we've got your request/i)).toBeVisible();
  const email = await latestEmailWithSubject(`New audit request from ${name}`);
  expect(email).toContain("Interested in: Pro");
  expect(email).toContain("Reply-To: tester@example.com");
});

test("error messages are readable on the light form", async ({ page }) => {
  await page.goto("/audit");
  await page.getByRole("button", { name: "Book my free audit" }).click();

  await expect(page.getByText("Enter your full name.")).toHaveCSS("color", "rgb(107, 31, 42)");
});

test("the floating button stays hidden here", async ({ page }) => {
  await page.goto("/audit");
  await page.getByRole("heading", { name: "Prefer to message us?" }).scrollIntoViewIfNeeded();

  await expect(page.getByTestId("floating-cta")).toBeHidden();
});

test("old /#contact links go to the audit page", async ({ page }) => {
  await page.goto("/#contact");

  await expect(page).toHaveURL(/\/audit$/);
  await expect(form(page)).toBeVisible();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the form is in the page, with the plan from the link preselected", async ({ page }) => {
    await page.goto("/audit?plan=custom");

    await expect(form(page)).toBeVisible();
    await expect(planField(page)).toHaveValue("custom");
  });
});
