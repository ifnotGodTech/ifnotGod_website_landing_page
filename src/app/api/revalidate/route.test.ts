import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidateTag }));

import { POST } from "./route";

const call = (secret?: string) =>
  POST(new NextRequest("https://www.ifnotgod.com/api/revalidate", { method: "POST", headers: secret ? { "x-refresh-secret": secret } : {} }));

describe("the refresh endpoint", () => {
  beforeEach(() => {
    vi.stubEnv("WEB_REFRESH_SECRET", "the-refresh-secret");
    revalidateTag.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("refreshes the cached catalogue and home page text for the backend", async () => {
    const response = await call("the-refresh-secret");

    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("catalogue", "max");
  });

  it.each([["a wrong secret", "guess"], ["no secret", undefined]])("refuses %s", async (_, secret) => {
    expect((await call(secret)).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses everything when no secret is set up", async () => {
    vi.stubEnv("WEB_REFRESH_SECRET", "");

    expect((await call("")).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
