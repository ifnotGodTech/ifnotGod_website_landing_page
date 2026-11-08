import { describe, expect, it, vi } from "vitest";

const jar = vi.hoisted(() => {
  const values = new Map<string, string>();
  return {
    values,
    get: (name: string) => (values.has(name) ? { value: values.get(name) } : undefined),
    set: (name: string, value: string) => values.set(name, value),
  };
});
vi.mock("next/headers", () => ({ cookies: async () => jar }));

import { cookieStubStore, emptyState } from "./stubStore";

describe("stand-in cookie store", () => {
  it("round-trips a client's state", async () => {
    const state = { ...emptyState("ada"), setupFeePaid: true };
    await cookieStubStore.write(state);

    expect(await cookieStubStore.read("ada")).toEqual(state);
  });

  it("starts afresh for a different user in the same browser", async () => {
    await cookieStubStore.write({ ...emptyState("ada"), setupFeePaid: true });

    expect(await cookieStubStore.read("bola")).toEqual(emptyState("bola"));
  });

  it("ignores a changed cookie", async () => {
    jar.values.set("ifng_stub_account", "changed.value");

    expect(await cookieStubStore.read("ada")).toEqual(emptyState("ada"));
  });
});
