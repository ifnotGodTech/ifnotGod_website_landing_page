import { cookies } from "next/headers";
import type { Payment, Subscription } from "@/types/account";
import { cookieSecret, signJson, verifyJson } from "./signing";

// Where the stand-in keeps a pretend subscription: a signed cookie in the visitor's own
// browser. It works on any server with no database, and disappears with the real backend.

export type StubAccountState = {
  userId: string;
  subscription: Subscription | null;
  payments: Payment[];
  setupFeePaid: boolean;
};

export type StubStore = {
  read(userId: string): Promise<StubAccountState>;
  write(state: StubAccountState): Promise<void>;
};

const COOKIE = "ifng_stub_account";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const emptyState = (userId: string): StubAccountState => ({
  userId,
  subscription: null,
  payments: [],
  setupFeePaid: false,
});

export const cookieStubStore: StubStore = {
  async read(userId) {
    const value = (await cookies()).get(COOKIE)?.value;
    const state = value ? verifyJson<StubAccountState>(value, cookieSecret()) : null;
    // A different user in the same browser starts afresh.
    return state && state.userId === userId ? state : emptyState(userId);
  },
  async write(state) {
    (await cookies()).set(COOKIE, signJson(state, cookieSecret(), Date.now() + MAX_AGE_SECONDS * 1000), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    });
  },
};

export function memoryStubStore(): StubStore {
  const states = new Map<string, StubAccountState>();
  return {
    async read(userId) {
      return structuredClone(states.get(userId) ?? emptyState(userId));
    },
    async write(state) {
      states.set(state.userId, structuredClone(state));
    },
  };
}
