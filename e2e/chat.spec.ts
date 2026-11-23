import { expect, test, type Page } from "@playwright/test";

// The AI assistant chat. /api/chat is answered here, in the browser, so these tests never reach n8n.

async function answerChat(page: Page, reply: string, status = 200) {
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(status === 200 ? { ok: true, reply } : { ok: false, error: reply }),
    })
  );
}

for (const [name, width, height] of [
  ["mobile", 320, 640],
  ["tablet", 768, 900],
  ["desktop", 1280, 800],
] as const) {
  test(`the chat opens, answers and fits the screen at ${name} width`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await answerChat(page, "Our plans:\n- **Starter**: NGN 20,000 a month\n\nEmail ifnotgodtech@gmail.com");
    await page.goto("/pricing");

    await page.getByRole("button", { name: "Chat with our assistant" }).click();
    const panel = page.getByRole("dialog", { name: "Chat with the IFNOTGOD TECH assistant" });
    await expect(panel).toBeVisible();

    await page.getByLabel("Your message").fill("What plans do you have?");
    await page.keyboard.press("Enter");
    await expect(panel.getByText("NGN 20,000 a month")).toBeVisible();
    await expect(panel.getByRole("link", { name: "ifnotgodtech@gmail.com" })).toHaveAttribute("href", "mailto:ifnotgodtech@gmail.com");

    // The whole window sits on screen, below the site's top bar, and the page doesn't scroll sideways.
    const box = await panel.boundingBox();
    const nav = await page.locator("nav, header").first().boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(box!.y).toBeGreaterThanOrEqual(nav ? nav.y + nav.height : 0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(height);
    await expect(page.getByRole("button", { name: "Close the chat" }).first()).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("the conversation carries on between pages", async ({ page }) => {
  await answerChat(page, "Hello from the assistant.");
  await page.goto("/");
  await page.getByRole("button", { name: "Chat with our assistant" }).click();
  await page.getByLabel("Your message").fill("Hi");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Hello from the assistant.")).toBeVisible();

  await page.getByRole("button", { name: "Close the chat" }).first().click();
  await page.goto("/services");
  await page.getByRole("button", { name: "Chat with our assistant" }).click();
  await expect(page.getByText("Hello from the assistant.")).toBeVisible();
});

test("the chat shows a failure and keeps the message to retry", async ({ page }) => {
  await answerChat(page, "The assistant isn't available right now.", 502);
  await page.goto("/");
  await page.getByRole("button", { name: "Chat with our assistant" }).click();
  await page.getByLabel("Your message").fill("Anyone there?");
  await page.keyboard.press("Enter");

  await expect(page.getByRole("dialog").getByRole("alert")).toHaveText("The assistant isn't available right now.");
  await expect(page.getByLabel("Your message")).toHaveValue("Anyone there?");
});

test("the chat button sits beside the audit button without covering it", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/pricing");
  await page.mouse.wheel(0, 1500);

  const cta = page.getByTestId("floating-cta").getByRole("link", { name: "Book a free audit" });
  await expect(cta).toBeVisible();
  const ctaBox = (await cta.boundingBox())!;
  const chatBox = (await page.getByTestId("chat-launcher").boundingBox())!;
  expect(ctaBox.x + ctaBox.width).toBeLessThanOrEqual(chatBox.x);
});
