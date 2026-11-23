import { afterEach, describe, expect, it, vi } from "vitest";

const getPublicPricing = vi.fn();
vi.mock("@/lib/catalogue", () => ({ getPublicPricing: (...args: unknown[]) => getPublicPricing(...args) }));

import { GET } from "./route";

describe("GET /api/pricing", () => {
  afterEach(() => {
    getPublicPricing.mockReset();
    vi.restoreAllMocks();
  });

  it("returns today's pricing as JSON", async () => {
    getPublicPricing.mockResolvedValue({ currency: "NGN", plans: [] });

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ currency: "NGN", plans: [] });
    expect(getPublicPricing).toHaveBeenCalledWith(expect.stringMatching(/^https?:\/\//));
  });

  it("says plainly when prices can't be loaded", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getPublicPricing.mockRejectedValue(new Error("The catalogue couldn't be loaded from the backend (UNAVAILABLE)."));

    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: "Prices are unavailable right now. Please try again shortly." });
  });
});
