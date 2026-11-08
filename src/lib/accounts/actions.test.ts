import { beforeEach, describe, expect, it, vi } from "vitest";
import { INITIAL_AUTH_STATE } from "./formState";
import { STUB_RULES } from "./stub";

const mocks = vi.hoisted(() => ({
  enabled: true,
  ip: 0,
  jar: { set: vi.fn(), get: vi.fn(), delete: vi.fn() },
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
}));

vi.mock("@/shared/features", () => ({
  get ACCOUNTS_ENABLED() {
    return mocks.enabled;
  },
}));
vi.mock("next/headers", () => ({
  cookies: async () => mocks.jar,
  headers: async () => new Headers({ "x-forwarded-for": `10.1.0.${mocks.ip}` }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { logInAction, logOutAction, resetPasswordAction, signUpAction } from "./actions";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.append(key, value));
  return data;
};

describe("account form actions", () => {
  beforeEach(() => {
    mocks.enabled = true;
    mocks.ip += 1;
    mocks.jar.set.mockReset();
    mocks.jar.delete.mockReset();
    mocks.redirect.mockClear();
  });

  it("returns field errors and keeps the email, but never the password", async () => {
    const state = await logInAction(INITIAL_AUTH_STATE, form({ email: "ada@", password: "secret" }));

    expect(state).toMatchObject({ status: "error", fieldErrors: { email: "Enter a valid email address." } });
    expect(state.values).toEqual({ email: "ada@" });
    expect(mocks.jar.set).not.toHaveBeenCalled();
  });

  it("explains a wrong password", async () => {
    const state = await logInAction(INITIAL_AUTH_STATE, form({ email: "ada@example.com", password: STUB_RULES.wrongPassword }));

    expect(state.formError).toMatch(/don't match/);
    expect(mocks.jar.set).not.toHaveBeenCalled();
  });

  it("starts a session and goes where the visitor was heading", async () => {
    await expect(
      logInAction(INITIAL_AUTH_STATE, form({ email: "ada@example.com", password: "secret", next: "/account/services" }))
    ).rejects.toThrow("REDIRECT /account/services");

    expect(mocks.jar.set).toHaveBeenCalledTimes(1);
  });

  it("never redirects to another website", async () => {
    await expect(
      logInAction(INITIAL_AUTH_STATE, form({ email: "ada@example.com", password: "secret", next: "https://evil.example" }))
    ).rejects.toThrow("REDIRECT /account");
  });

  it("slows down repeated attempts from one address", async () => {
    let state = INITIAL_AUTH_STATE;
    for (let attempt = 0; attempt < 11; attempt++) {
      state = await logInAction(INITIAL_AUTH_STATE, form({ email: "ada@example.com", password: STUB_RULES.wrongPassword }));
    }

    expect(state.formError).toMatch(/Too many attempts/);
  });

  it("explains an email that's already registered, keeping what was typed", async () => {
    const state = await signUpAction(
      INITIAL_AUTH_STATE,
      form({ fullName: "Ada Obi", businessName: "Obi Logistics", email: STUB_RULES.takenEmail, password: "long enough" })
    );

    expect(state.formError).toMatch(/already an account/);
    expect(state.values).toEqual({ fullName: "Ada Obi", businessName: "Obi Logistics", email: STUB_RULES.takenEmail });
  });

  it("signs up and starts a session", async () => {
    await expect(
      signUpAction(INITIAL_AUTH_STATE, form({ fullName: "Ada Obi", email: "ada@example.com", password: "long enough" }))
    ).rejects.toThrow("REDIRECT /account");

    expect(mocks.jar.set).toHaveBeenCalledTimes(1);
  });

  it("confirms a reset request the same way for any email", async () => {
    const state = await resetPasswordAction(INITIAL_AUTH_STATE, form({ email: "anyone@example.com" }));

    expect(state).toMatchObject({ status: "success", values: { email: "anyone@example.com" } });
  });

  it("does nothing while accounts are switched off", async () => {
    mocks.enabled = false;

    const state = await logInAction(INITIAL_AUTH_STATE, form({ email: "ada@example.com", password: "secret" }));

    expect(state.formError).toMatch(/aren't available/);
    expect(mocks.jar.set).not.toHaveBeenCalled();
  });

  it("logs out and returns home", async () => {
    await expect(logOutAction()).rejects.toThrow("REDIRECT /");

    expect(mocks.jar.delete).toHaveBeenCalled();
  });
});
