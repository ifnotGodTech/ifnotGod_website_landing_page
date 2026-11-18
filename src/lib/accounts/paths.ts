export const ACCOUNT_HOME = "/account";

/** Only paths on this site, so a link can't send someone to another website after logging in. */
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return ACCOUNT_HOME;
  }
  return value;
}

export function withNext(path: string, next: string): string {
  return next === ACCOUNT_HOME ? path : `${path}?next=${encodeURIComponent(next)}`;
}

/** Log in again, saying why, such as "google" when Google sign-in didn't work. */
export function loginWithError(next: string, error: "google"): string {
  const path = withNext("/login", next);
  return `${path}${path.includes("?") ? "&" : "?"}error=${error}`;
}
