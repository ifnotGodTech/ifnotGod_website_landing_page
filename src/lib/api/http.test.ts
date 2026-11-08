import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { apiRequest } from "./http";

const requestHeaders = vi.hoisted(() => ({ value: new Headers() }));
vi.mock("next/headers", () => ({ headers: async () => requestHeaders.value }));

const schema = z.object({ name: z.string() });
const fetchMock = vi.fn();
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("apiRequest", () => {
  beforeEach(() => {
    vi.stubEnv("BACKEND_API_URL", "https://api.example.com/");
    vi.stubEnv("BACKEND_APP_KEY", "web-key");
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    requestHeaders.value = new Headers();
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("calls the versioned API with WEB's key and returns checked data", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { name: "Ada" }));

    expect(await apiRequest("/catalogue/plans/", { schema })).toEqual({ ok: true, data: { name: "Ada" } });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.com/api/v1/catalogue/plans/");
    expect(options).toMatchObject({ method: "GET", cache: "no-store", headers: { "x-app-key": "web-key" } });
  });

  it("sends the visitor's own address, and leaves it out when there isn't one", async () => {
    requestHeaders.value = new Headers({ "x-forwarded-for": "102.89.1.10, 76.76.21.1" });
    fetchMock.mockResolvedValue(json(200, { name: "Ada" }));

    await apiRequest("/x", { schema });
    requestHeaders.value = new Headers();
    await apiRequest("/x", { schema });

    expect(fetchMock.mock.calls[0][1].headers["x-visitor-ip"]).toBe("102.89.1.10");
    expect(fetchMock.mock.calls[1][1].headers).not.toHaveProperty("x-visitor-ip");
  });

  it("sends a JSON body and extra headers", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { name: "Ada" }));

    await apiRequest("/x", { method: "POST", body: { name: "Ada" }, schema, headers: { authorization: "Bearer t" } });

    const options = fetchMock.mock.calls[0][1];
    expect(options.body).toBe('{"name":"Ada"}');
    expect(options.headers).toMatchObject({ "content-type": "application/json", authorization: "Bearer t" });
  });

  it("passes on the backend's message, field errors and detail code for validation", async () => {
    fetchMock.mockResolvedValueOnce(
      json(400, { code: "VALIDATION", message: "Check the highlighted fields.", errors: { email: ["That email already has an account."] }, detailCode: "EMAIL_TAKEN" })
    );

    expect(await apiRequest("/x", { schema })).toEqual({
      ok: false,
      error: { code: "VALIDATION", status: 400, message: "Check the highlighted fields.", fieldErrors: { email: "That email already has an account." }, detailCode: "EMAIL_TAKEN" },
    });
  });

  it("keeps its own message for other failures, but still passes the detail code", async () => {
    fetchMock.mockResolvedValueOnce(json(401, { code: "UNAUTHENTICATED", message: "internal wording", errors: {}, detailCode: "LOCKED" }));

    expect(await apiRequest("/x", { schema })).toEqual({
      ok: false,
      error: { code: "UNAUTHENTICATED", status: 401, message: "Your session has ended. Please log in again.", fieldErrors: {}, detailCode: "LOCKED" },
    });
  });

  it.each([
    [403, "FORBIDDEN"],
    [404, "NOT_FOUND"],
    [409, "CONFLICT"],
    [429, "RATE_LIMITED"],
    [503, "UNAVAILABLE"],
    [500, "UNEXPECTED"],
  ])("turns status %i into %s", async (status, code) => {
    fetchMock.mockResolvedValueOnce(json(status, {}));

    expect(await apiRequest("/x", { schema })).toMatchObject({ ok: false, error: { code, status } });
  });

  it("refuses a response in an unexpected shape", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { name: 42 }));

    expect(await apiRequest("/x", { schema })).toMatchObject({ ok: false, error: { code: "UNEXPECTED" } });
  });

  it("says the backend can't be reached when the request fails or isn't configured", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    expect(await apiRequest("/x", { schema })).toMatchObject({ ok: false, error: { code: "UNAVAILABLE", status: null } });

    vi.stubEnv("BACKEND_APP_KEY", "");
    expect(await apiRequest("/x", { schema })).toMatchObject({ ok: false, error: { code: "UNAVAILABLE" } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
