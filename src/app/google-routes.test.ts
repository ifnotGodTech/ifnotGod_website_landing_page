import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signInWithGoogle: vi.fn(),
  startSession: vi.fn(),
}));
vi.mock("@/shared/features", () => ({ ACCOUNTS_ENABLED: true }));
vi.mock("@/lib/accounts/api", () => ({ signInWithGoogle: mocks.signInWithGoogle }));
vi.mock("@/lib/accounts/session", () => ({ startSession: mocks.startSession }));

import { GOOGLE_COOKIE, newAttempt, sealAttempt } from "@/lib/accounts/google";
import { cookieSecret } from "@/lib/accounts/signing";
import { GET as start } from "./(site)/login/google/route";
import { GET as callback } from "./(site)/login/google/callback/route";

const user = { id: "7", fullName: "Ada Obi", email: "ada@example.com", signInMethod: "google" };

function callbackRequest(query: string, attempt = newAttempt("/account/services")) {
  const cookie = `${GOOGLE_COOKIE}=${sealAttempt(attempt, cookieSecret())}`;
  return { attempt, request: new NextRequest(`https://ifnotgod.com/login/google/callback?${query}`, { headers: { cookie } }) };
}

describe("Google sign-in routes", () => {
  beforeEach(() => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "client-id");
    mocks.signInWithGoogle.mockReset();
    mocks.startSession.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("starts by sending the visitor to Google, remembering the attempt in a cookie for the callback", async () => {
    const response = await start(new NextRequest("https://ifnotgod.com/login/google?next=/account/services"));

    const location = new URL(response.headers.get("location")!);
    expect(location.hostname).toBe("accounts.google.com");
    expect(location.searchParams.get("redirect_uri")).toBe("https://ifnotgod.com/login/google/callback");
    const cookie = response.cookies.get(GOOGLE_COOKIE);
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/login/google", maxAge: 600 });
  });

  it("explains on the log in page when Google isn't set up", async () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "");

    const response = await start(new NextRequest("https://ifnotgod.com/login/google?next=/account/services"));

    expect(response.headers.get("location")).toBe("https://ifnotgod.com/login?next=%2Faccount%2Fservices&error=google");
  });

  it("signs in with Google's code and the attempt's verifier, then goes where the visitor was heading", async () => {
    mocks.signInWithGoogle.mockResolvedValueOnce({ ok: true, value: { token: "t0ken", user } });
    const { attempt, request } = callbackRequest("code=4%2Fabc&state=");
    request.nextUrl.searchParams.set("state", attempt.state);

    const response = await callback(new NextRequest(request.nextUrl, { headers: request.headers }));

    expect(mocks.signInWithGoogle).toHaveBeenCalledWith({
      code: "4/abc",
      redirectUri: "https://ifnotgod.com/login/google/callback",
      codeVerifier: attempt.codeVerifier,
    });
    expect(mocks.startSession).toHaveBeenCalledWith({ token: "t0ken", user });
    expect(response.headers.get("location")).toBe("https://ifnotgod.com/account/services");
  });

  it("refuses a callback whose state doesn't match this browser's attempt, without asking the backend", async () => {
    const { request } = callbackRequest("code=4%2Fabc&state=someone-elses");

    const response = await callback(request);

    expect(response.headers.get("location")).toBe("https://ifnotgod.com/login?next=%2Faccount%2Fservices&error=google");
    expect(mocks.signInWithGoogle).not.toHaveBeenCalled();
  });

  it("refuses a callback without a started attempt, and explains a refusal from the backend", async () => {
    const bare = await callback(new NextRequest("https://ifnotgod.com/login/google/callback?code=x&state=y"));
    expect(bare.headers.get("location")).toBe("https://ifnotgod.com/login?error=google");

    mocks.signInWithGoogle.mockResolvedValueOnce({ ok: false, error: "GOOGLE_FAILED" });
    const attempt = newAttempt("/account");
    const { request } = callbackRequest(`code=x&state=${attempt.state}`, attempt);
    const refused = await callback(request);
    expect(refused.headers.get("location")).toBe("https://ifnotgod.com/login?error=google");
    expect(mocks.startSession).not.toHaveBeenCalled();
  });
});
