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

import { POST } from "./route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
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
});
