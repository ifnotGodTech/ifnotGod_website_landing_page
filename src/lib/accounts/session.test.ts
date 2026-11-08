import { afterEach, describe, expect, it, vi } from "vitest";
import type { AccountUser } from "@/types/account";

const jar = vi.hoisted(() => ({ set: vi.fn(), get: vi.fn(), delete: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => jar }));

import { decodeSession, encodeSession, endSession, readSession, SESSION_COOKIE, startSession } from "./session";

const user: AccountUser = { id: "u1", fullName: "Ada Obi", email: "ada@example.com", signInMethod: "password" };
const DAY = 24 * 60 * 60 * 1000;

describe("session cookie", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    jar.set.mockReset();
    jar.get.mockReset();
    jar.delete.mockReset();
  });

  it("round-trips the user", () => {
    expect(decodeSession(encodeSession(user, "secret"), "secret")).toEqual(user);
  });

  it("rejects a cookie signed with another secret", () => {
    expect(decodeSession(encodeSession(user, "secret"), "other")).toBeNull();
  });

  it("rejects a cookie whose contents were changed", () => {
    const [, signature] = encodeSession(user, "secret").split(".");
    const forged = Buffer.from(JSON.stringify({ user: { ...user, id: "admin" }, exp: Date.now() + DAY })).toString("base64url");

    expect(decodeSession(`${forged}.${signature}`, "secret")).toBeNull();
  });

  it.each(["", "abc", "a.b.c", "not.base64!"])("rejects the malformed value %j", (value) => {
    expect(decodeSession(value, "secret")).toBeNull();
  });

  it("expires after 7 days", () => {
    const now = Date.now();
    const value = encodeSession(user, "secret", now);

    expect(decodeSession(value, "secret", now + 6 * DAY)).toEqual(user);
    expect(decodeSession(value, "secret", now + 7 * DAY)).toBeNull();
  });

  it("sets a cookie scripts can't read, kept for 7 days", async () => {
    await startSession(user);

    const [name, , options] = jar.set.mock.calls[0];
    expect(name).toBe(SESSION_COOKIE);
    expect(options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 });
  });

  it("reads back the signed-in user, or no one", async () => {
    await startSession(user);
    jar.get.mockReturnValueOnce({ value: jar.set.mock.calls[0][1] });
    expect(await readSession()).toEqual(user);

    jar.get.mockReturnValueOnce(undefined);
    expect(await readSession()).toBeNull();
  });

  it("deletes the cookie on log out", async () => {
    await endSession();

    expect(jar.delete).toHaveBeenCalledWith(SESSION_COOKIE);
  });

  it("refuses to sign sessions in production without its own secret", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("ACCOUNTS_SESSION_SECRET", "");

    await expect(startSession(user)).rejects.toThrow("ACCOUNTS_SESSION_SECRET must be set");
  });
});
