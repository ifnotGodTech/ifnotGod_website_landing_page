import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { AccountUser } from "@/types/account";

// The login session, in a signed cookie that scripts in the browser can't read. When the
// real backend is connected (phase 12), it sets and checks its own session instead.

export const SESSION_COOKIE = "ifng_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const DEV_SECRET = "local-development-only-session-secret";

function sessionSecret(): string {
  const secret = process.env.ACCOUNTS_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("ACCOUNTS_SESSION_SECRET must be set in production.");
  }
  return DEV_SECRET;
}

const sign = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest("base64url");

export function encodeSession(user: AccountUser, secret: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ user, exp: now + MAX_AGE_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

/** Returns the user, or null if the cookie was changed, is malformed or has expired. */
export function decodeSession(value: string, secret: string, now = Date.now()): AccountUser | null {
  const [payload, signature, ...rest] = value.split(".");
  if (!payload || !signature || rest.length > 0) return null;

  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { user?: AccountUser; exp?: number };
    if (typeof data.exp !== "number" || data.exp <= now || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function startSession(user: AccountUser): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, encodeSession(user, sessionSecret()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readSession(): Promise<AccountUser | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value ? decodeSession(value, sessionSecret()) : null;
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
