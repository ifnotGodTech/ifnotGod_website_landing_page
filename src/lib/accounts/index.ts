import { redirect } from "next/navigation";
import type { AccountUser } from "@/types/account";
import type { AccountsBackend } from "./backend";
import { withNext } from "./paths";
import { readSession } from "./session";
import { createStubBackend } from "./stub";

// The only way screens reach the account backend. Phase 12 swaps the stand-in for the real API here.
export function getAccountsBackend(): AccountsBackend {
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("The stand-in account backend must never run in production. Connect the real API first.");
  }
  return createStubBackend();
}

export function getCurrentUser(): Promise<AccountUser | null> {
  return readSession();
}

/** For account pages: the signed-in user, or a redirect to log in and come back to `path`. */
export async function requireUser(path: string): Promise<AccountUser> {
  const user = await readSession();
  if (!user) redirect(withNext("/login", path));
  return user;
}
