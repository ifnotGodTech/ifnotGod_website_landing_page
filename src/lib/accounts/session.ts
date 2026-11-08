import { cookies } from "next/headers";
import type { AccountUser } from "@/types/account";
import { cookieSecret, signJson, verifyJson } from "./signing";

// The login session, in a signed cookie that scripts in the browser can't read. When the
// real backend is connected (phase 12), it sets and checks its own session instead.

export const SESSION_COOKIE = "ifng_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function encodeSession(user: AccountUser, secret: string, now = Date.now()): string {
  return signJson(user, secret, now + MAX_AGE_SECONDS * 1000);
}

/** Returns the user, or null if the cookie was changed, is malformed or has expired. */
export function decodeSession(value: string, secret: string, now = Date.now()): AccountUser | null {
  return verifyJson<AccountUser>(value, secret, now);
}

export async function startSession(user: AccountUser): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, encodeSession(user, cookieSecret()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readSession(): Promise<AccountUser | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value ? decodeSession(value, cookieSecret()) : null;
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
