import { cookies } from "next/headers";
import type { AccountUser } from "@/types/account";
import { openJson, sealJson } from "./sealing";
import { cookieSecret } from "./signing";

// The login session: an encrypted cookie that scripts in the browser can't read, holding the backend's
// token and who it's for. The backend owns the session: it ends the token after 7 days without
// activity, and logging out revokes it. Account pages confirm the token with the backend (see index.ts).

export const SESSION_COOKIE = "ifng_session";
// Longer than the backend's 7 idle days, so an active client isn't logged out by the cookie itself.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type Session = { user: AccountUser; token: string };

export function encodeSession(session: Session, secret: string): string {
  return sealJson(session, secret);
}

/** The session, or null if the cookie was changed, sealed with another secret, or is malformed. */
export function decodeSession(value: string, secret: string): Session | null {
  const session = openJson<Session>(value, secret);
  return session && typeof session.token === "string" && typeof session.user?.id === "string" ? session : null;
}

export async function startSession(session: Session): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, encodeSession(session, cookieSecret()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** What the cookie says, unconfirmed. Pages use getCurrentUser or requireUser instead. */
export async function readSession(): Promise<Session | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value ? decodeSession(value, cookieSecret()) : null;
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
