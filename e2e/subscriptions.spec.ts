import { expect, test, type Page } from "@playwright/test";
import { ADA, CLIENT_PASSWORD, SOMEONE_ELSE } from "./backend";

// Accounts use the real backend. Subscriptions still use the stand-in and its stand-in payment page,
// kept in each browser's own cookies. No money is ever taken.

let nextAddress = 0;
test.beforeEach(async ({ page }, testInfo) => {
  nextAddress += 1;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `10.${100 + (testInfo.workerIndex % 150)}.${Math.floor(nextAddress / 250)}.${nextAddress % 250}` });
});

async function logIn(page: Page) {
  await page.getByLabel("Email").fill(ADA);
  await page.getByLabel("Password").fill(CLIENT_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
}

async function subscribe(page: Page, plan = "Growth", period = "Monthly") {
  await page.goto("/login?next=/account/subscribe");
  await logIn(page);
  await expect(page.getByRole("heading", { level: 1, name: "Choose your plan" })).toBeVisible();

  await page.getByRole("radio", { name: new RegExp(plan) }).check();
  await page.getByRole("radio", { name: new RegExp(period) }).check();
  await page.getByRole("button", { name: /with Flutterwave/ }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Payment" })).toBeVisible();
  await page.getByRole("button", { name: /^Pay ₦/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Choose your services" })).toBeVisible();
}

async function chooseServices(page: Page, names: string[]) {
  for (const name of names) await page.getByRole("checkbox", { name }).check();
}

test("Subscribe on Pricing leads through log in to that plan", async ({ page }) => {
  await page.goto("/pricing?plan=pro");

  await page.getByRole("link", { name: "Subscribe to Pro" }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Faccount%2Fsubscribe%3Fplan%3Dpro$/);

  await logIn(page);

  await expect(page).toHaveURL(/\/account\/subscribe\?plan=pro$/);
  await expect(page.getByRole("radio", { name: /Pro/ })).toBeChecked();
});

test("the total follows the plan and payment option", async ({ page }) => {
  await page.goto("/login?next=/account/subscribe");
  await logIn(page);

  await expect(page.getByRole("button", { name: "Pay ₦140,000 with Flutterwave" })).toBeVisible();
  await page.getByRole("radio", { name: /6 months upfront/ }).check();
  await expect(page.getByRole("button", { name: "Pay ₦240,000 with Flutterwave" })).toBeVisible();
  await page.getByRole("radio", { name: /Starter/ }).check();
  await page.getByRole("radio", { name: /12 months upfront/ }).check();
  await expect(page.getByRole("button", { name: "Pay ₦200,000 with Flutterwave" })).toBeVisible();
});

test("paying starts the plan, then the client chooses services", async ({ page }) => {
  await subscribe(page, "Growth", "6 months upfront");
  await expect(page.getByText("Payment received. Welcome to Growth.")).toBeVisible();
  await expect(page.getByText(/doesn't use any of your monthly changes/)).toBeVisible();
  await expect(page.getByText(/includes 3 everyday automations, 2 social or content services, 1 AI agent/)).toBeVisible();

  await chooseServices(page, ["Lead follow-up", "Daily business brief", "Payment reminders and receipts"]);
  await expect(page.getByRole("checkbox", { name: "Brand deal inbox" })).toBeDisabled();
  await chooseServices(page, ["Scheduling and posting", "WhatsApp sales agent"]);
  await page.getByRole("button", { name: "Save my services" }).click();

  await expect(page).toHaveURL(/\/account\?updated=services$/);
  await expect(page.getByRole("heading", { level: 2, name: "Growth plan" })).toBeVisible();
  await expect(page.getByText("₦40,000 a month, paid 6 months upfront")).toBeVisible();
  await expect(page.getByText("Renews automatically")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "WhatsApp sales agent" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "₦240,000" })).toBeVisible();
});

test("swapping a service uses a monthly change", async ({ page }) => {
  await subscribe(page);
  await chooseServices(page, ["Lead follow-up"]);
  await page.getByRole("button", { name: "Save my services" }).click();
  await expect(page).toHaveURL(/updated=services/);

  await page.getByRole("link", { name: "Change services" }).click();
  await expect(page.getByText("1 change left this month")).toBeVisible();
  await page.getByRole("checkbox", { name: "Lead follow-up" }).uncheck();
  await chooseServices(page, ["Daily business brief"]);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/updated=services/);

  await page.getByRole("link", { name: "Change services" }).click();
  await expect(page.getByText("0 changes left this month")).toBeVisible();
  await page.getByRole("checkbox", { name: "Daily business brief" }).uncheck();
  await chooseServices(page, ["Brand deal inbox"]);
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("status")).toContainText("You've used this month's changes");
});

test("changing plan waits for the next renewal", async ({ page }) => {
  await subscribe(page);
  await page.goto("/account");

  await page.getByRole("link", { name: "Change plan" }).click();
  await expect(page.getByText(/There's nothing to pay today/)).toBeVisible();
  await page.getByRole("radio", { name: /Pro/ }).check();
  await page.getByRole("button", { name: "Save plan change" }).click();

  await expect(page).toHaveURL(/updated=plan/);
  await expect(page.getByText(/Moves to Pro on/)).toBeVisible();
});

test("cancelling keeps the plan to the end of the period, and can be undone", async ({ page }) => {
  await subscribe(page);
  await page.goto("/account");

  await page.getByRole("link", { name: "Cancel subscription" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cancel your Growth plan?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Keep my plan" })).toHaveCSS("background-color", "rgb(107, 31, 42)");
  await page.getByLabel("Why are you leaving? (optional)").selectOption("It costs too much");
  await page.getByRole("button", { name: "Cancel subscription" }).click();

  await expect(page).toHaveURL(/updated=cancelled/);
  await expect(page.getByText(/Your subscription is cancelled.*Everything keeps working until/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Change services" })).toHaveCount(0);

  await page.getByRole("button", { name: "Keep my plan" }).click();
  await expect(page).toHaveURL(/updated=resumed/);
  await expect(page.getByText("Active", { exact: true })).toBeVisible();
});

test("the subscription belongs to the signed-in client only", async ({ page, context }) => {
  await subscribe(page);
  await context.clearCookies({ name: "ifng_session" });

  await page.goto("/login");
  await page.getByLabel("Email").fill(SOMEONE_ELSE);
  await page.getByLabel("Password").fill(CLIENT_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByText("You haven't subscribed yet.")).toBeVisible();
});

for (const [label, width] of [
  ["mobile", 320],
  ["tablet", 768],
  ["desktop", 1280],
] as const) {
  test(`subscription pages fit at ${label} width`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await subscribe(page);

    for (const path of ["/account/services", "/account", "/account/subscribe", "/account/cancel"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path).toBe(true);
    }
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("subscribing and paying still work", async ({ page }) => {
    await subscribe(page, "Starter", "Monthly");

    await chooseServices(page, ["Lead follow-up"]);
    await page.getByRole("button", { name: "Save my services" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Starter plan" })).toBeVisible();
  });
});
