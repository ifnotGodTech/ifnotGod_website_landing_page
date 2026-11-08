import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  session: null as unknown,
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
}));
vi.mock("./session", () => ({ readSession: async () => mocks.session }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { getAccountsBackend, requireUser } from "./index";

describe("accounts module", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    mocks.session = null;
  });

  it("uses the stand-in outside production", () => {
    expect(getAccountsBackend().logIn).toBeTypeOf("function");
  });

  it("refuses to run the stand-in in production", () => {
    vi.stubEnv("VERCEL_ENV", "production");

    expect(() => getAccountsBackend()).toThrow("must never run in production");
  });

  it("sends signed-out visitors to log in, then back", async () => {
    await expect(requireUser("/account/services")).rejects.toThrow("REDIRECT /login?next=%2Faccount%2Fservices");
  });

  it("returns the signed-in user", async () => {
    mocks.session = { id: "u1" };

    expect(await requireUser("/account")).toEqual({ id: "u1" });
  });
});
