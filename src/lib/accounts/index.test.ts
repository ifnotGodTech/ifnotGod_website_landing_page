import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiError } from "@/lib/api/errors";

const mocks = vi.hoisted(() => ({
  session: null as unknown,
  getSignedInUser: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
}));
vi.mock("./session", () => ({ readSession: async () => mocks.session }));
vi.mock("./api", () => ({ getSignedInUser: mocks.getSignedInUser }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { ACCOUNTS_UNAVAILABLE, getCurrentUser, requireSession, requireUser } from "./index";

const user = { id: "7", fullName: "Ada Obi", email: "ada@example.com", signInMethod: "password" };

describe("accounts module", () => {
  beforeEach(() => {
    mocks.session = null;
    mocks.getSignedInUser.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("sends signed-out visitors to log in, then back, without calling the backend", async () => {
    await expect(requireUser("/account/services")).rejects.toThrow("REDIRECT /login?next=%2Faccount%2Fservices");
    expect(mocks.getSignedInUser).not.toHaveBeenCalled();
  });

  it("confirms the token with the backend and uses who it says is signed in", async () => {
    mocks.session = { user: { ...user, fullName: "Old name" }, token: "t0ken" };
    mocks.getSignedInUser.mockResolvedValue({ ok: true, data: user });

    expect(await requireUser("/account")).toEqual(user);
    expect(await requireSession("/account")).toEqual({ user, token: "t0ken" });
    expect(mocks.getSignedInUser).toHaveBeenCalledWith("t0ken");
  });

  it("treats a token the backend has ended as signed out", async () => {
    mocks.session = { user, token: "revoked" };
    mocks.getSignedInUser.mockResolvedValue({ ok: false, error: apiError("UNAUTHENTICATED", 401) });

    expect(await getCurrentUser()).toBeNull();
    await expect(requireUser("/account")).rejects.toThrow("REDIRECT /login");
  });

  it("says accounts are unavailable when the backend can't be reached, instead of logging out", async () => {
    mocks.session = { user, token: "t0ken" };
    mocks.getSignedInUser.mockResolvedValue({ ok: false, error: apiError("UNAVAILABLE") });

    expect(await getCurrentUser()).toBeNull();
    await expect(requireUser("/account")).rejects.toThrow(ACCOUNTS_UNAVAILABLE);
  });
});
