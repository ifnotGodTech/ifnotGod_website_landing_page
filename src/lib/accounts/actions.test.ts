import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AccountErrorCode } from "@/types/account";
import { INITIAL_AUTH_STATE } from "./formState";

const mocks = vi.hoisted(() => ({
  enabled: true,
  ip: 0,
  cookies: new Map<string, string>(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
  api: { logIn: vi.fn(), signUp: vi.fn(), requestPasswordReset: vi.fn(), setNewPassword: vi.fn(), logOut: vi.fn() },
}));

vi.mock("@/shared/features", () => ({
  get ACCOUNTS_ENABLED() {
    return mocks.enabled;
  },
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (mocks.cookies.has(name) ? { value: mocks.cookies.get(name) } : undefined),
    set: (name: string, value: string) => void mocks.cookies.set(name, value),
    delete: (name: string) => void mocks.cookies.delete(name),
  }),
  headers: async () => new Headers({ "x-forwarded-for": `10.1.0.${mocks.ip}` }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("./api", () => mocks.api);

import { logInAction, logOutAction, resetPasswordAction, setNewPasswordAction, signUpAction } from "./actions";
import { readSession, SESSION_COOKIE } from "./session";

const user = { id: "7", fullName: "Ada Obi", email: "ada@example.com", signInMethod: "password" as const };
const signedIn = { ok: true, value: { token: "t0ken", user } };
const refused = (error: AccountErrorCode) => ({ ok: false, error });

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.append(key, value));
  return data;
};

describe("account form actions", () => {
  beforeEach(() => {
    mocks.enabled = true;
    mocks.ip += 1;
    mocks.cookies.clear();
    mocks.redirect.mockClear();
    Object.values(mocks.api).forEach((fn) => fn.mockReset());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns field errors and keeps the email, but never the password, without calling the backend", async () => {
    const state = await logInAction(INITIAL_AUTH_STATE, form({ email: "ada@", password: "secret" }));

    expect(state).toMatchObject({ status: "error", fieldErrors: { email: "Enter a valid email address." } });
    expect(state.values).toEqual({ email: "ada@" });
    expect(mocks.api.logIn).not.toHaveBeenCalled();
  });

  it("explains a wrong password", async () => {
    mocks.api.logIn.mockResolvedValueOnce(refused("INVALID_CREDENTIALS"));

    const state = await logInAction(INITIAL_AUTH_STATE, form({ email: "ada@example.com", password: "wrong" }));

    expect(state.formError).toMatch(/don't match/);
    expect(mocks.cookies.has(SESSION_COOKIE)).toBe(false);
  });

  it("starts a session holding the backend's token, and goes where the visitor was heading", async () => {
    mocks.api.logIn.mockResolvedValueOnce(signedIn);

    await expect(
      logInAction(INITIAL_AUTH_STATE, form({ email: "ada@example.com", password: "secret", next: "/account/services" }))
    ).rejects.toThrow("REDIRECT /account/services");

    expect(await readSession()).toEqual({ token: "t0ken", user });
  });

  it("never redirects to another website", async () => {
    mocks.api.logIn.mockResolvedValueOnce(signedIn);

    await expect(
      logInAction(INITIAL_AUTH_STATE, form({ email: "ada@example.com", password: "secret", next: "https://evil.example" }))
    ).rejects.toThrow("REDIRECT /account");
  });

  it("slows down repeated attempts from one address before the backend is asked", async () => {
    mocks.api.logIn.mockResolvedValue(refused("INVALID_CREDENTIALS"));
    let state = INITIAL_AUTH_STATE;
    for (let attempt = 0; attempt < 11; attempt++) {
      state = await logInAction(INITIAL_AUTH_STATE, form({ email: "ada@example.com", password: "wrong" }));
    }

    expect(state.formError).toMatch(/Too many attempts/);
    expect(mocks.api.logIn).toHaveBeenCalledTimes(10);
  });

  it("explains an email that's already registered, keeping what was typed", async () => {
    mocks.api.signUp.mockResolvedValueOnce(refused("EMAIL_TAKEN"));

    const state = await signUpAction(
      INITIAL_AUTH_STATE,
      form({ fullName: "Ada Obi", businessName: "Obi Logistics", email: "taken@example.com", password: "long enough" })
    );

    expect(state.formError).toMatch(/already an account/);
    expect(state.values).toEqual({ fullName: "Ada Obi", businessName: "Obi Logistics", email: "taken@example.com" });
  });

  it("asks for a 10-character password before calling the backend, and explains a weak one", async () => {
    const short = await signUpAction(INITIAL_AUTH_STATE, form({ fullName: "Ada Obi", email: "ada@example.com", password: "123456789" }));
    mocks.api.signUp.mockResolvedValueOnce(refused("WEAK_PASSWORD"));
    const weak = await signUpAction(INITIAL_AUTH_STATE, form({ fullName: "Ada Obi", email: "ada@example.com", password: "1234567890" }));

    expect(short.fieldErrors.password).toBe("Use at least 10 characters.");
    expect(weak.formError).toMatch(/stronger password/);
    expect(mocks.api.signUp).toHaveBeenCalledTimes(1);
  });

  it("signs up and starts a session", async () => {
    mocks.api.signUp.mockResolvedValueOnce(signedIn);

    await expect(
      signUpAction(INITIAL_AUTH_STATE, form({ fullName: "Ada Obi", email: "ada@example.com", password: "long enough" }))
    ).rejects.toThrow("REDIRECT /account");

    expect(mocks.api.signUp).toHaveBeenCalledWith({ fullName: "Ada Obi", email: "ada@example.com", password: "long enough" });
    expect(mocks.cookies.has(SESSION_COOKIE)).toBe(true);
  });

  it("confirms a reset request the same way for any email", async () => {
    mocks.api.requestPasswordReset.mockResolvedValueOnce({ ok: true, value: null });

    const state = await resetPasswordAction(INITIAL_AUTH_STATE, form({ email: "anyone@example.com" }));

    expect(state).toMatchObject({ status: "success", values: { email: "anyone@example.com" } });
  });

  it("sets a new password from the link, then signs in and opens the account", async () => {
    mocks.api.setNewPassword.mockResolvedValueOnce(signedIn);

    await expect(
      setNewPasswordAction(INITIAL_AUTH_STATE, form({ uid: "Nw", token: "abc-123", password: "a brand new password" }))
    ).rejects.toThrow("REDIRECT /account");

    expect(mocks.api.setNewPassword).toHaveBeenCalledWith({ uid: "Nw", token: "abc-123", password: "a brand new password" });
    expect(mocks.cookies.has(SESSION_COOKIE)).toBe(true);
  });

  it("explains a used or expired link, and a link missing its parts", async () => {
    mocks.api.setNewPassword.mockResolvedValueOnce(refused("RESET_LINK_INVALID"));

    const used = await setNewPasswordAction(INITIAL_AUTH_STATE, form({ uid: "Nw", token: "old", password: "a brand new password" }));
    const broken = await setNewPasswordAction(INITIAL_AUTH_STATE, form({ uid: "", token: "", password: "a brand new password" }));

    expect(used.formError).toMatch(/expired or has already been used/);
    expect(broken.formError).toMatch(/expired or has already been used/);
    expect(mocks.api.setNewPassword).toHaveBeenCalledTimes(1);
  });

  it("does nothing while accounts are switched off", async () => {
    mocks.enabled = false;

    const state = await logInAction(INITIAL_AUTH_STATE, form({ email: "ada@example.com", password: "secret" }));

    expect(state.formError).toMatch(/aren't available/);
    expect(mocks.api.logIn).not.toHaveBeenCalled();
  });

  it("logs out by revoking the token with the backend, then returns home", async () => {
    mocks.api.logIn.mockResolvedValueOnce(signedIn);
    await logInAction(INITIAL_AUTH_STATE, form({ email: "ada@example.com", password: "secret" })).catch(() => {});
    mocks.api.logOut.mockResolvedValueOnce({ ok: true, data: null });

    await expect(logOutAction()).rejects.toThrow("REDIRECT /");

    expect(mocks.api.logOut).toHaveBeenCalledWith("t0ken");
    expect(mocks.cookies.has(SESSION_COOKIE)).toBe(false);
  });

  it("still ends the session when the backend can't be reached to log out", async () => {
    mocks.api.logIn.mockResolvedValueOnce(signedIn);
    await logInAction(INITIAL_AUTH_STATE, form({ email: "ada@example.com", password: "secret" })).catch(() => {});
    mocks.api.logOut.mockResolvedValueOnce({ ok: false, error: { code: "UNAVAILABLE" } });

    await expect(logOutAction()).rejects.toThrow("REDIRECT /");

    expect(mocks.cookies.has(SESSION_COOKIE)).toBe(false);
  });
});
