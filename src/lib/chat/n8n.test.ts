import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { askAssistant } from "./n8n";

const request = { sessionId: "3f2c9a1e-6b4d-4a8e-9f10-123456789abc", message: "How much is Starter?" };
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("askAssistant", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("N8N_CHAT_URL", "https://example.app.n8n.cloud/webhook/abc/chat");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    fetchMock.mockReset();
  });

  it("sends the message in n8n's chat format and returns the reply", async () => {
    fetchMock.mockResolvedValue(json(200, { output: "Starter is NGN 20,000 a month." }));

    expect(await askAssistant(request)).toEqual({ ok: true, reply: "Starter is NGN 20,000 a month." });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.app.n8n.cloud/webhook/abc/chat");
    expect(JSON.parse(init.body)).toEqual({ action: "sendMessage", sessionId: request.sessionId, chatInput: request.message });
    expect(init.headers.authorization).toBeUndefined();
  });

  it("sends Basic Auth when the chat trigger uses it", async () => {
    vi.stubEnv("N8N_CHAT_AUTH", "site:secret");
    fetchMock.mockResolvedValue(json(200, { output: "Hi" }));

    await askAssistant(request);
    expect(fetchMock.mock.calls[0][1].headers.authorization).toBe(`Basic ${Buffer.from("site:secret").toString("base64")}`);
  });

  it("says when it isn't set up", async () => {
    vi.stubEnv("N8N_CHAT_URL", "");
    expect(await askAssistant(request)).toEqual({ ok: false, reason: "not-configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports n8n errors, unreadable answers and network failures, without logging the message", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Internal Server Error", { status: 500 }));
    expect(await askAssistant(request)).toEqual({ ok: false, reason: "unavailable" });

    fetchMock.mockResolvedValueOnce(json(200, { message: "Workflow was started" }));
    expect(await askAssistant(request)).toEqual({ ok: false, reason: "bad-reply" });

    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    expect(await askAssistant(request)).toEqual({ ok: false, reason: "unavailable" });

    const logged = vi.mocked(console.error).mock.calls.flat().join(" ");
    expect(logged).not.toContain(request.message);
  });

  it("reports a timeout", async () => {
    fetchMock.mockRejectedValue(new DOMException("The operation timed out.", "TimeoutError"));
    expect(await askAssistant(request)).toEqual({ ok: false, reason: "timeout" });
  });
});
