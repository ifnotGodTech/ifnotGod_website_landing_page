import type { AccountResult, AccountUser, LogInInput, SignUpInput } from "@/types/account";

/** What the screens need from an account backend. The stand-in and, later, the real API both provide it. */
export type AccountsBackend = {
  signUp(input: SignUpInput): Promise<AccountResult<AccountUser>>;
  logIn(input: LogInInput): Promise<AccountResult<AccountUser>>;
  signInWithGoogle(): Promise<AccountResult<AccountUser>>;
  requestPasswordReset(email: string): Promise<AccountResult<null>>;
};

export const ok = <T>(value: T): AccountResult<T> => ({ ok: true, value });
export const fail = <T>(error: Extract<AccountResult<T>, { ok: false }>["error"]): AccountResult<T> => ({
  ok: false,
  error,
});
