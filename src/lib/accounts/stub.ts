import type { AccountUser } from "@/types/account";
import { fail, ok, type AccountsBackend } from "./backend";

// A stand-in backend until the real one exists (phase 12). Nothing is stored: any email and
// password logs in. A few fixed values show each error, for previews and tests:
export const STUB_RULES = {
  takenEmail: "taken@example.com",
  lockedEmail: "locked@example.com",
  wrongPassword: "wrong-password",
} as const;

function stubUser(user: Omit<AccountUser, "id">): AccountUser {
  return { id: `stub-${Buffer.from(user.email.toLowerCase()).toString("base64url")}`, ...user };
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return local.replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Client";
}

export function createStubBackend(): AccountsBackend {
  return {
    async signUp({ fullName, businessName, email }) {
      if (email.toLowerCase() === STUB_RULES.takenEmail) return fail("EMAIL_TAKEN");
      return ok(stubUser({ fullName, businessName, email, signInMethod: "password" }));
    },
    async logIn({ email, password }) {
      if (email.toLowerCase() === STUB_RULES.lockedEmail) return fail("TOO_MANY_ATTEMPTS");
      if (password === STUB_RULES.wrongPassword) return fail("INVALID_CREDENTIALS");
      return ok(stubUser({ fullName: nameFromEmail(email), email, signInMethod: "password" }));
    },
    async signInWithGoogle() {
      return ok(stubUser({ fullName: "Ada Obi", email: "ada@example.com", signInMethod: "google" }));
    },
    async requestPasswordReset() {
      return ok(null);
    },
  };
}
