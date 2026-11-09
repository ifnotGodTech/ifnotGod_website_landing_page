import { afterEach, describe, expect, it, vi } from "vitest";
import type { AccountUser } from "@/types/account";

const jar = vi.hoisted(() => ({ set: vi.fn(), get: vi.fn(), delete: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => jar }));

import { decodeSession, encodeSession, endSession, readSession, SESSION_COOKIE, startSession } from "./session";

const user: AccountUser = { id: "u1", fullName: "Ada Obi", email: "ada@example.com", signInMethod: "password" };
const session = { user, token: "backend-token" };

describe("session cookie", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    jar.set.mockReset();
    jar.get.mockReset();
    jar.delete.mockReset();
  });

  it("round-trips the user and the backend's token", () => {
    expect(decodeSession(encodeSession(session, "secret"), "secret")).toEqual(session);
  });

  it("keeps the token out of sight: the cookie is encrypted, not just signed", () => {
    const value = encodeSession(session, "secret");

    expect(Buffer.from(value, "base64url").toString("latin1")).not.toContain("backend-token");
    expect(value).not.toContain("ada");
  });

  it("rejects a cookie sealed with another secret, a changed one, and junk", () => {
    const value = encodeSession(session, "secret");
    const bytes = Buffer.from(value, "base64url");
    bytes[bytes.length - 1] ^= 1;

    expect(decodeSession(value, "other")).toBeNull();
    expect(decodeSession(bytes.toString("base64url"), "secret")).toBeNull();
    expect(decodeSession("forged.value", "secret")).toBeNull();
  });

  it("sets an HTTP-only cookie that outlasts the backend's 7 idle days", async () => {
    await startSession(session);

    const [name, value, options] = jar.set.mock.calls[0];
    expect(name).toBe(SESSION_COOKIE);
    expect(decodeSession(value, "local-development-only-session-secret")).toEqual(session);
    expect(options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
  });

  it("is secure in production, and needs its secret set there", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");

    await expect(startSession(session)).rejects.toThrow("ACCOUNTS_SESSION_SECRET");
    vi.stubEnv("ACCOUNTS_SESSION_SECRET", "a-real-secret");
    await startSession(session);
    expect(jar.set.mock.calls[0][2]).toMatchObject({ secure: true });
  });

  it("reads the session back, or nothing", async () => {
    jar.get.mockReturnValueOnce({ value: encodeSession(session, "local-development-only-session-secret") });
    expect(await readSession()).toEqual(session);

    jar.get.mockReturnValueOnce(undefined);
    expect(await readSession()).toBeNull();
  });

  it("ends the session", async () => {
    await endSession();

    expect(jar.delete).toHaveBeenCalledWith(SESSION_COOKIE);
  });
});
