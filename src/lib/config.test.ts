import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTACT_INFO } from "@/shared/constants";

describe("config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("sends leads to the public contact address when no recipient is set", async () => {
    vi.stubEnv("CONTACT_RECIPIENT_EMAIL", undefined as unknown as string);

    const { config } = await import("./config");

    expect(config.brevo.recipientEmail).toBe(CONTACT_INFO.email);
  });

  it("uses the configured recipient when set", async () => {
    vi.stubEnv("CONTACT_RECIPIENT_EMAIL", "leads@example.com");

    const { config } = await import("./config");

    expect(config.brevo.recipientEmail).toBe("leads@example.com");
  });
});
