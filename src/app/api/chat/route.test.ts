import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const askAssistant = vi.fn();
const features = vi.hoisted(() => ({ CHAT_ENABLED: true }));

vi.mock("@/lib/chat/n8n", () => ({ askAssistant: (...args: unknown[]) => askAssistant(...args) }));
vi.mock("@/shared/features", () => features);

import { POST } from "./route";

const sessionId = "3f2c9a1e-6b4d-4a8e-9f10-123456789abc";
// A fresh address per request keeps tests independent of the shared rate limiters.
let nextIp = 0;

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", host: "localhost", "x-forwarded-for": `10.1.0.${nextIp++}`, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  afterEach(() => {
    askAssistant.mockReset();
    features.CHAT_ENABLED = true;
  });

  it("returns the assistant's reply, never cached", async () => {
    askAssistant.mockResolvedValue({ ok: true, reply: "Starter is NGN 20,000 a month." });

    const response = await POST(makeRequest({ sessionId, message: "How much is Starter?" }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ ok: true, reply: "Starter is NGN 20,000 a month." });
    expect(askAssistant).toHaveBeenCalledWith({ sessionId, message: "How much is Starter?" });
  });

  it("doesn't exist while the chat is switched off", async () => {
    features.CHAT_ENABLED = false;
    expect((await POST(makeRequest({ sessionId, message: "Hi" }))).status).toBe(404);
    expect(askAssistant).not.toHaveBeenCalled();
  });

  it("refuses other sites, other formats and oversized bodies", async () => {
    expect((await POST(makeRequest({ sessionId, message: "Hi" }, { origin: "https://evil.example" }))).status).toBe(403);
    expect((await POST(makeRequest({ sessionId, message: "Hi" }, { "content-type": "text/plain" }))).status).toBe(415);
    expect((await POST(makeRequest({ sessionId, message: "Hi" }, { "content-length": String(64 * 1024) }))).status).toBe(413);
    expect(askAssistant).not.toHaveBeenCalled();
  });

  it("refuses invalid messages with a plain reason", async () => {
    const empty = await POST(makeRequest({ sessionId, message: "  " }));
    expect(empty.status).toBe(400);
    expect(await empty.json()).toEqual({ ok: false, error: "Type a message first." });
    expect((await POST(makeRequest("not json"))).status).toBe(400);
    expect(askAssistant).not.toHaveBeenCalled();
  });

  it("slows down a visitor sending too many messages", async () => {
    askAssistant.mockResolvedValue({ ok: true, reply: "Hi" });
    const headers = { "x-forwarded-for": "10.2.0.1" };

    const statuses = [];
    for (let i = 0; i < 9; i++) statuses.push((await POST(makeRequest({ sessionId, message: "Hi" }, headers))).status);
    expect(statuses.slice(0, 8)).toEqual(Array(8).fill(200));
    expect(statuses[8]).toBe(429);
  });

  it("turns the assistant's failures into plain messages", async () => {
    askAssistant.mockResolvedValueOnce({ ok: false, reason: "timeout" });
    const slow = await POST(makeRequest({ sessionId, message: "Hi" }));
    expect(slow.status).toBe(504);
    expect((await slow.json()).error).toMatch(/taking too long/);

    askAssistant.mockResolvedValueOnce({ ok: false, reason: "unavailable" });
    const down = await POST(makeRequest({ sessionId, message: "Hi" }));
    expect(down.status).toBe(502);
    expect((await down.json()).error).toMatch(/isn't available right now/);

    askAssistant.mockResolvedValueOnce({ ok: false, reason: "not-configured" });
    expect((await POST(makeRequest({ sessionId, message: "Hi" }))).status).toBe(503);
  });
});
