import { createHash, randomBytes } from "node:crypto";
import { openJson, sealJson } from "./sealing";

// Google sign-in, server side. WEB sends the visitor to Google with a random state and a PKCE
// challenge, remembered in a short-lived encrypted cookie. Google sends them back with a one-time
// code, which the backend exchanges with the client secret and checks. WEB never holds the secret.

export const GOOGLE_COOKIE = "ifng_google";
export const GOOGLE_COOKIE_MAX_AGE = 10 * 60;
const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export type GoogleAttempt = { state: string; codeVerifier: string; next: string };

/** Google's client id, from the OAuth client in Google Cloud. Public, but set per environment. */
export function googleClientId(): string | null {
  return process.env.GOOGLE_CLIENT_ID || null;
}

export const callbackUrl = (origin: string) => `${origin}/login/google/callback`;

export function newAttempt(next: string): GoogleAttempt {
  return { state: randomBytes(16).toString("base64url"), codeVerifier: randomBytes(32).toString("base64url"), next };
}

export function authorizeUrl(clientId: string, origin: string, attempt: GoogleAttempt): string {
  const challenge = createHash("sha256").update(attempt.codeVerifier).digest("base64url");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl(origin),
    response_type: "code",
    scope: "openid email profile",
    state: attempt.state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return `${AUTHORIZE_URL}?${params}`;
}

export const sealAttempt = (attempt: GoogleAttempt, secret: string) => sealJson(attempt, secret);

export function openAttempt(value: string | undefined, secret: string): GoogleAttempt | null {
  const attempt = value ? openJson<GoogleAttempt>(value, secret) : null;
  return attempt && typeof attempt.state === "string" && typeof attempt.codeVerifier === "string" ? attempt : null;
}
