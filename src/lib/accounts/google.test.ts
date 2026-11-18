import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { authorizeUrl, newAttempt, openAttempt, sealAttempt } from "./google";

describe("Google sign-in", () => {
  it("sends the visitor to Google with our callback, a random state and a PKCE challenge", () => {
    const attempt = newAttempt("/account/services");
    const url = new URL(authorizeUrl("client-id", "https://ifnotgod.com", attempt));

    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: "client-id",
      redirect_uri: "https://ifnotgod.com/login/google/callback",
      response_type: "code",
      scope: "openid email profile",
      state: attempt.state,
      code_challenge: createHash("sha256").update(attempt.codeVerifier).digest("base64url"),
      code_challenge_method: "S256",
      prompt: "select_account",
    });
  });

  it("makes a new state and verifier each time, long enough for PKCE", () => {
    const [a, b] = [newAttempt("/account"), newAttempt("/account")];

    expect(a.state).not.toBe(b.state);
    expect(a.codeVerifier.length).toBeGreaterThanOrEqual(43);
  });

  it("keeps the attempt in a sealed cookie value, refusing a changed one", () => {
    const attempt = newAttempt("/account");
    const sealed = sealAttempt(attempt, "secret");

    expect(openAttempt(sealed, "secret")).toEqual(attempt);
    expect(sealed).not.toContain(attempt.codeVerifier);
    expect(openAttempt(sealed, "other")).toBeNull();
    expect(openAttempt(undefined, "secret")).toBeNull();
  });
});
