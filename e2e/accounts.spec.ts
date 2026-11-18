import { expect, test, type Page } from "@playwright/test";
import { ADA, CLIENT_PASSWORD, latestResetLink, TAKEN, uniqueEmail } from "./backend";

// Uses the real backend, with the client accounts serve_for_e2e.sh creates.
const WRONG_PASSWORD = "not the password";

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

async function logIn(page: Page, email = ADA, password = CLIENT_PASSWORD) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
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

async function signUp(page: Page, email: string, password = "a long new password") {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("Ada Obi");
  await page.getByLabel("Business or brand name (optional)").fill("Obi Logistics");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
}

test("signing up starts a session and opens the account", async ({ page }) => {
  const email = uniqueEmail("ada");
  await signUp(page, email);

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole("heading", { level: 1, name: "Hello, Ada" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Hello, Ada" })).toHaveCSS("color", "rgb(247, 241, 236)");
  await expect(page.getByText(`Obi Logistics · ${email}`)).toBeVisible();
});

test("a password the backend finds too weak is explained", async ({ page }) => {
  await signUp(page, uniqueEmail("weak"), "1234567890");

  await expect(page.getByRole("status")).toContainText("stronger password");
});

test("an account page sends signed-out visitors to log in, then back", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login$/);

  await logIn(page);

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole("heading", { level: 1, name: "Hello, Ada" })).toBeVisible();
});

test("logging out ends the session everywhere, even if an old session cookie comes back", async ({ page, context }) => {
  await page.goto("/login");
  await logIn(page);
  await expect(page).toHaveURL(/\/account$/);
  const before = (await context.cookies()).find((cookie) => cookie.name === "ifng_session")!;

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/account");
  await expect(page).toHaveURL(/\/login$/);

  // A copy of the cookie still holds the token, but the backend revoked it on log out.
  await context.addCookies([before]);
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login$/);
});

test("the menu offers the account once logged in, and Log in again after logging out", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/login");
  await logIn(page);
  await expect(page).toHaveURL(/\/account$/);

  await page.goto("/pricing");
  const menu = page.locator("nav").first();
  await expect(menu.getByRole("link", { name: "Your account" })).toHaveAttribute("href", "/account");
  await expect(menu.getByRole("link", { name: "Log in" })).toHaveCount(0);

  await page.goto("/account");
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("nav").first().getByRole("link", { name: "Log in" })).toBeVisible();
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

  await logIn(page, "wrong.password@example.com", WRONG_PASSWORD);

  await expect(page.getByRole("status")).toContainText("don't match");
  await expect(page.getByLabel("Email")).toHaveValue("wrong.password@example.com");
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
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
  await page.getByLabel("Email").fill(TAKEN);
  await page.getByLabel("Password", { exact: true }).fill("a long new password");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("status")).toContainText("already an account");
  await expect(page.getByLabel("Full name")).toHaveValue("Ada Obi");
});

test("a password reset is confirmed", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Reset your password" })).toBeVisible();

  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();

  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
});

test("a reset link sets a new password once, and logs the client in", async ({ page, context }) => {
  const email = uniqueEmail("reset");
  await signUp(page, email);
  await expect(page).toHaveURL(/\/account$/);
  await context.clearCookies();

  await page.goto("/reset-password");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();

  const link = await latestResetLink(email);
  await page.goto(link);
  await expect(page.getByRole("heading", { level: 1, name: "Set a new password" })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill("another long password");
  await page.getByRole("button", { name: "Save and log in" }).click();
  await expect(page).toHaveURL(/\/account$/);

  // The link works once.
  await context.clearCookies();
  await page.goto(link);
  await page.getByLabel("New password", { exact: true }).fill("a third long password");
  await page.getByRole("button", { name: "Save and log in" }).click();
  await expect(page.getByRole("status")).toContainText("expired or has already been used");

  await page.goto("/login");
  await logIn(page, email, "another long password");
  await expect(page).toHaveURL(/\/account$/);
});

test("Google sign-in sends the visitor to Google, coming back to our callback", async ({ page }) => {
  await page.goto("/login?next=/account/services");
  await expect(page.getByRole("link", { name: "Continue with Google" })).toHaveAttribute("href", "/login/google?next=%2Faccount%2Fservices");

  // Read where it sends the visitor without following it: the tests never go to Google.
  const response = await page.request.get("/login/google?next=/account/services", { maxRedirects: 0 });

  expect(response.status()).toBe(307);
  const url = new URL(response.headers()["location"]);
  expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
  expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:3100/login/google/callback");
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  expect(response.headers()["set-cookie"]).toContain("ifng_google=");
});

test("a Google callback that this browser didn't start is refused and explained", async ({ page }) => {
  await page.goto("/login/google/callback?code=made-up&state=made-up");

  await expect(page).toHaveURL(/\/login\?error=google$/);
  await expect(page.getByRole("form", { name: "Log in" }).getByRole("alert")).toContainText("We couldn't sign you in with Google");
});

test("a link can't send someone to another website after logging in", async ({ page }) => {
  await page.goto("/login?next=https://evil.example");

  await logIn(page);

  await expect(page).toHaveURL(/localhost:3100\/account$/);
});

test("repeated failed logins from one address are slowed down", async ({ page }) => {
  await page.goto("/login");

  // Every attempt shows the same message, so each one waits for its own response. React clears
  // the password after each attempt; typing before that lands would send an empty form, which
  // is refused before it's counted, so the limit would never be reached.
  const password = page.getByLabel("Password", { exact: true });
  for (let attempt = 0; attempt < 11; attempt++) {
    await expect(password).toHaveValue("");
    await Promise.all([
      page.waitForResponse((response) => response.request().method() === "POST"),
      logIn(page, "repeated.failures@example.com", WRONG_PASSWORD),
    ]);
  }

  await expect(page.getByRole("status")).toContainText("Too many attempts");
});

test("the keyboard can complete log in", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").focus();
  await page.keyboard.type(ADA);
  await page.keyboard.press("Tab");
  await page.keyboard.type(CLIENT_PASSWORD);
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
