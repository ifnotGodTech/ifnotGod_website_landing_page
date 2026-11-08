import { expect, test, type Page } from "@playwright/test";

// Uses the stand-in backend: any email logs in, and a few fixed values show errors.
const TAKEN_EMAIL = "taken@example.com";
const WRONG_PASSWORD = "wrong-password";

test.beforeAll(async ({ request }) => {
  const response = await request.get("/login");
  expect(response.status(), "Build with accounts switched on: run `npm run build:e2e` first").toBe(200);
});

// The sign-in forms limit attempts per address. Give each test its own, as real visitors have.
let nextAddress = 0;
// Each parallel test runner numbers its own tests, so its number goes in the address too.
test.beforeEach(async ({ page }, testInfo) => {
  nextAddress += 1;
  const address = `10.${testInfo.workerIndex % 250}.${Math.floor(nextAddress / 250)}.${nextAddress % 250}`;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": address });
});

async function logIn(page: Page, email = "ada.obi@example.com", password = "a secret") {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

for (const [label, width] of [
  ["mobile", 320],
  ["tablet", 768],
  ["desktop", 1280],
] as const) {
  test(`sign-in pages and the account page fit at ${label} width`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });

    for (const path of ["/login", "/signup", "/reset-password"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }

    await page.goto("/login");
    await logIn(page);
    await expect(page).toHaveURL(/\/account$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("the navigation offers Log in", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  await page.locator("nav").first().getByRole("link", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/login$/);
});

test("signing up starts a session and opens the account", async ({ page }) => {
  await page.goto("/signup");

  await page.getByLabel("Full name").fill("Ada Obi");
  await page.getByLabel("Business or brand name (optional)").fill("Obi Logistics");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Password").fill("long enough");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole("heading", { level: 1, name: "Hello, Ada" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Hello, Ada" })).toHaveCSS("color", "rgb(247, 241, 236)");
  await expect(page.getByText("Obi Logistics · ada@example.com")).toBeVisible();
});

test("an account page sends signed-out visitors to log in, then back", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login$/);

  await logIn(page);

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole("heading", { level: 1, name: "Hello, Ada" })).toBeVisible();
});

test("logging out ends the session", async ({ page }) => {
  await page.goto("/login");
  await logIn(page);
  await expect(page).toHaveURL(/\/account$/);

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/account");
  await expect(page).toHaveURL(/\/login$/);
});

test("the session cookie can't be read by scripts on the page", async ({ page, context }) => {
  await page.goto("/login");
  await logIn(page);
  await expect(page).toHaveURL(/\/account$/);

  const cookie = (await context.cookies()).find((item) => item.name === "ifng_session");
  expect(cookie).toMatchObject({ httpOnly: true, sameSite: "Lax" });
  expect(await page.evaluate(() => document.cookie)).not.toContain("ifng_session");
});

test("a changed session cookie is refused", async ({ page, context }) => {
  await context.addCookies([{ name: "ifng_session", value: "forged.value", url: "http://localhost:3100" }]);

  await page.goto("/account");

  await expect(page).toHaveURL(/\/login$/);
});

test("signed-in visitors skip the log in page", async ({ page }) => {
  await page.goto("/login");
  await logIn(page);
  await expect(page).toHaveURL(/\/account$/);

  await page.goto("/login");

  await expect(page).toHaveURL(/\/account$/);
});

test("a wrong password is explained, and the email is kept", async ({ page }) => {
  await page.goto("/login");

  await logIn(page, "ada@example.com", WRONG_PASSWORD);

  await expect(page.getByRole("status")).toContainText("don't match");
  await expect(page.getByLabel("Email")).toHaveValue("ada@example.com");
  await expect(page.getByLabel("Password")).toHaveValue("");
});

test("empty fields are explained, with focus kept on the page", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByText("Enter your email address.")).toBeVisible();
  await expect(page.getByText("Enter your password.")).toBeVisible();
  await expect(page.getByText("Enter your password.")).toHaveCSS("color", "rgb(107, 31, 42)");
});

test("an email that's already registered is explained", async ({ page }) => {
  await page.goto("/signup");

  await page.getByLabel("Full name").fill("Ada Obi");
  await page.getByLabel("Email").fill(TAKEN_EMAIL);
  await page.getByLabel("Password").fill("long enough");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("status")).toContainText("already an account");
  await expect(page.getByLabel("Full name")).toHaveValue("Ada Obi");
});

test("a password reset is confirmed", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Reset your password" })).toBeVisible();

  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();

  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
});

test("Google sign-in returns to where the visitor was going", async ({ page }) => {
  await page.goto("/login?next=/account");

  await page.getByRole("link", { name: "Continue with Google" }).click();

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByText("Google", { exact: true })).toBeVisible();
});

test("a link can't send someone to another website after logging in", async ({ page }) => {
  await page.goto("/login?next=https://evil.example");

  await logIn(page);

  await expect(page).toHaveURL(/localhost:3100\/account$/);
});

test("repeated failed logins from one address are slowed down", async ({ page }) => {
  await page.goto("/login");

  for (let attempt = 0; attempt < 11; attempt++) {
    await logIn(page, "ada@example.com", WRONG_PASSWORD);
    await expect(page.getByRole("status")).not.toBeEmpty();
  }

  await expect(page.getByRole("status")).toContainText("Too many attempts");
});

test("the keyboard can complete log in", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").focus();
  await page.keyboard.type("ada@example.com");
  await page.keyboard.press("Tab");
  await page.keyboard.type("a secret");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/account$/);
});

test("account pages aren't cached or indexed", async ({ page }) => {
  await page.goto("/login");
  await logIn(page);
  const response = await page.goto("/account");

  expect(response?.headers()["cache-control"]).toContain("no-store");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("logging in still works", async ({ page }) => {
    await page.goto("/login");

    await logIn(page);

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole("heading", { level: 1, name: "Hello, Ada" })).toBeVisible();
  });
});
