import { cache } from "react";
import { redirect } from "next/navigation";
import type { AccountUser } from "@/types/account";
import { getSignedInUser } from "./api";
import { withNext } from "./paths";
import { readSession } from "./session";

// Who is signed in, confirmed with the backend. Accounts are in ./api.ts, subscriptions in ./subscriptions.ts.

export type AccountSession =
  | { status: "active"; user: AccountUser; token: string }
  | { status: "none" }
  /** The backend couldn't be reached, so nobody can be confirmed. Not the same as signed out. */
  | { status: "unavailable" };

export const ACCOUNTS_UNAVAILABLE = "Accounts aren't available right now.";

/** The session, confirmed with the backend, which may have ended it. Checked once per request. */
export const readAccountSession = cache(async (): Promise<AccountSession> => {
  const session = await readSession();
  if (!session) return { status: "none" };
  const confirmed = await getSignedInUser(session.token);
  if (confirmed.ok) return { status: "active", user: confirmed.data, token: session.token };
  if (confirmed.error.code === "UNAUTHENTICATED") return { status: "none" };
  return { status: "unavailable" };
});

/** The signed-in client, or null. Used to skip the log in page, so an outage just shows the form. */
export async function getCurrentUser(): Promise<AccountUser | null> {
  const session = await readAccountSession();
  return session.status === "active" ? session.user : null;
}

/** For account pages and actions: the signed-in client and their token, or a redirect to log in and come back to `path`. */
export async function requireSession(path: string): Promise<{ user: AccountUser; token: string }> {
  const session = await readAccountSession();
  if (session.status === "active") return { user: session.user, token: session.token };
  if (session.status === "unavailable") throw new Error(ACCOUNTS_UNAVAILABLE);
  redirect(withNext("/login", path));
}

export async function requireUser(path: string): Promise<AccountUser> {
  return (await requireSession(path)).user;
}
