import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiError } from "@/lib/api/errors";
import { accountErrorFor, getSignedInUser, logIn, logOut, requestPasswordReset, setNewPassword, signInWithGoogle, signUp } from "./api";

vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "102.89.1.10" }) }));

const fetchMock = vi.fn();
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const apiUser = { id: "7", fullName: "Ada Obi", email: "ada@example.com", businessName: null, signInMethod: "password" };
const sent = (n = 0) => {
  const [url, options] = fetchMock.mock.calls[n];
  return { url, method: options.method, headers: options.headers, body: options.body ? JSON.parse(options.body) : undefined };
};

describe("account API", () => {
  beforeEach(() => {
    vi.stubEnv("BACKEND_API_URL", "https://api.example.com");
    vi.stubEnv("BACKEND_APP_KEY", "web-key");
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("signs up, with the visitor's address for the backend's limits", async () => {
    fetchMock.mockResolvedValueOnce(json(201, { token: "t0ken", user: apiUser }));

    const result = await signUp({ fullName: "Ada Obi", email: "ada@example.com", password: "long enough" });

    expect(result).toEqual({ ok: true, value: { token: "t0ken", user: { ...apiUser, businessName: undefined } } });
    expect(sent()).toMatchObject({
      url: "https://api.example.com/api/v1/account/sign-up/",
      method: "POST",
      headers: { "x-app-key": "web-key", "x-visitor-ip": "102.89.1.10" },
      body: { fullName: "Ada Obi", businessName: "", email: "ada@example.com", password: "long enough" },
    });
  });

  it("logs in, signs in with Google, and sets a new password", async () => {
    fetchMock.mockImplementation(async () => json(200, { token: "t0ken", user: { ...apiUser, businessName: "Obi Logistics" } }));

    expect(await logIn({ email: "ada@example.com", password: "pw" })).toMatchObject({ ok: true, value: { user: { businessName: "Obi Logistics" } } });
    await signInWithGoogle({ code: "4/abc", redirectUri: "https://ifnotgod.com/login/google/callback", codeVerifier: "v" });
    await setNewPassword({ uid: "Nw", token: "abc", password: "a brand new password" });

    expect([sent(0).url, sent(1).url, sent(2).url]).toEqual([
      "https://api.example.com/api/v1/account/log-in/",
      "https://api.example.com/api/v1/account/google/",
      "https://api.example.com/api/v1/account/password-reset/new/",
    ]);
    expect(sent(1).body).toEqual({ code: "4/abc", redirectUri: "https://ifnotgod.com/login/google/callback", codeVerifier: "v" });
  });

  it("asks for a reset link, which answers with no content", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    expect(await requestPasswordReset("ada@example.com")).toEqual({ ok: true, value: null });
  });

  it("sends the token to see who is signed in, and to log out", async () => {
    fetchMock.mockResolvedValueOnce(json(200, apiUser)).mockResolvedValueOnce(new Response(null, { status: 204 }));

    expect(await getSignedInUser("t0ken")).toMatchObject({ ok: true, data: { id: "7" } });
    expect(await logOut("t0ken")).toEqual({ ok: true, data: null });
    expect(sent(0)).toMatchObject({ url: "https://api.example.com/api/v1/account/me/", headers: { authorization: "Bearer t0ken" } });
    expect(sent(1)).toMatchObject({ url: "https://api.example.com/api/v1/account/log-out/", method: "POST" });
  });

  it("passes on why the backend refused", async () => {
    fetchMock.mockResolvedValueOnce(json(409, { code: "CONFLICT", message: "That email already has an account.", errors: {}, detailCode: "EMAIL_TAKEN" }));

    expect(await signUp({ fullName: "Ada Obi", email: "ada@example.com", password: "long enough" })).toEqual({ ok: false, error: "EMAIL_TAKEN" });
  });

  it.each([
    [apiError("VALIDATION", 400, { detailCode: "WRONG_DETAILS" }), "INVALID_CREDENTIALS"],
    [apiError("VALIDATION", 400, { detailCode: "WEAK_PASSWORD" }), "WEAK_PASSWORD"],
    [apiError("CONFLICT", 409, { detailCode: "RESET_LINK_INVALID" }), "RESET_LINK_INVALID"],
    [apiError("VALIDATION", 400, { detailCode: "GOOGLE_FAILED" }), "GOOGLE_FAILED"],
    [apiError("RATE_LIMITED", 429, { detailCode: "LOCKED" }), "TOO_MANY_ATTEMPTS"],
    [apiError("RATE_LIMITED", 429), "TOO_MANY_ATTEMPTS"],
    [apiError("UNAVAILABLE"), "UNAVAILABLE"],
    [apiError("UNEXPECTED", 500), "UNAVAILABLE"],
  ])("turns %j into %s", (error, code) => {
    expect(accountErrorFor(error)).toBe(code);
  });
});
