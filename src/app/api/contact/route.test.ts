import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const sendContactNotification = vi.fn();

vi.mock("@/lib/notifications/email", async () => {
  const actual = await vi.importActual<typeof import("@/lib/notifications/email")>(
    "@/lib/notifications/email"
  );
  return {
    ...actual,
    sendContactNotification: (...args: unknown[]) => sendContactNotification(...args),
  };
});

import { EmailNotConfiguredError } from "@/lib/notifications/email";
import { HONEYPOT_FIELD } from "@/shared/constants";
import { POST } from "./route";

// A fresh IP per request keeps tests independent of the shared rate limiter.
let nextIp = 0;

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "localhost",
      "x-forwarded-for": `10.0.0.${nextIp++}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  fullName: "Ada Obi",
  organisation: "Obi Logistics",
  email: "ada@obilogistics.com",
  phone: "+2348012345678",
  challenge: "Our dispatch process is entirely manual and error-prone.",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    sendContactNotification.mockReset();
  });

  it("returns 200 and delivers a valid submission", async () => {
    sendContactNotification.mockResolvedValueOnce(undefined);
    const response = await POST(makeRequest(validPayload));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(sendContactNotification).toHaveBeenCalledTimes(1);
  });

  it("delivers the chosen plan, and drops fields the form no longer has", async () => {
    sendContactNotification.mockResolvedValueOnce(undefined);
    await POST(makeRequest({ ...validPayload, plan: "pro", desiredOutcome: "Old field" }));

    const delivered = sendContactNotification.mock.calls[0][0];
    expect(delivered.plan).toBe("pro");
    expect(delivered).not.toHaveProperty("desiredOutcome");
  });

  it("rejects a plan that isn't on offer", async () => {
    const response = await POST(makeRequest({ ...validPayload, plan: "platinum" }));

    expect(response.status).toBe(400);
    expect((await response.json()).errors.plan).toBeDefined();
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid submission and does not attempt delivery", async () => {
    const response = await POST(makeRequest({ fullName: "", email: "not-an-email", challenge: "short" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(json.errors.fullName).toBeDefined();
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  it("returns 502 when delivery fails unexpectedly", async () => {
    sendContactNotification.mockRejectedValueOnce(new Error("network down"));
    const response = await POST(makeRequest(validPayload));
    const json = await response.json();

    expect(response.status).toBe(502);
    expect(json.ok).toBe(false);
  });

  it("returns 503 with a helpful message when email isn't configured", async () => {
    sendContactNotification.mockRejectedValueOnce(new EmailNotConfiguredError());
    const response = await POST(makeRequest(validPayload));
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.error).toMatch(/whatsapp/i);
  });

  it("returns 429 after too many submissions from one IP", async () => {
    sendContactNotification.mockResolvedValue(undefined);
    const headers = { "x-forwarded-for": "10.9.9.9" };

    for (let i = 0; i < 5; i++) {
      expect((await POST(makeRequest(validPayload, headers))).status).toBe(200);
    }
    const response = await POST(makeRequest(validPayload, headers));

    expect(response.status).toBe(429);
    expect(sendContactNotification).toHaveBeenCalledTimes(5);
  });

  it("reports success for a filled honeypot without delivering anything", async () => {
    const response = await POST(makeRequest({ ...validPayload, [HONEYPOT_FIELD]: "spam" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  it("delivers when the honeypot is empty", async () => {
    sendContactNotification.mockResolvedValueOnce(undefined);
    const response = await POST(makeRequest({ ...validPayload, [HONEYPOT_FIELD]: "" }));

    expect(response.status).toBe(200);
    expect(sendContactNotification).toHaveBeenCalledTimes(1);
  });

  it("rejects requests from another origin", async () => {
    const response = await POST(makeRequest(validPayload, { origin: "https://evil.example" }));

    expect(response.status).toBe(403);
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  it("accepts requests from the site's own origin", async () => {
    sendContactNotification.mockResolvedValueOnce(undefined);
    const response = await POST(makeRequest(validPayload, { origin: "https://localhost" }));

    expect(response.status).toBe(200);
  });

  it("rejects non-JSON content types", async () => {
    const response = await POST(makeRequest(validPayload, { "content-type": "text/plain" }));

    expect(response.status).toBe(415);
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  it("rejects oversized requests", async () => {
    const response = await POST(makeRequest(validPayload, { "content-length": String(64 * 1024) }));

    expect(response.status).toBe(413);
    expect(sendContactNotification).not.toHaveBeenCalled();
  });
});
