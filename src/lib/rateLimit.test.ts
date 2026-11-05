import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rateLimit";

const options = { windowMs: 1000, maxRequests: 2, maxTrackedKeys: 3 };

describe("createRateLimiter", () => {
  it("allows requests up to the limit, then blocks", () => {
    const limiter = createRateLimiter(options);

    expect(limiter.isLimited("a", 0)).toBe(false);
    expect(limiter.isLimited("a", 1)).toBe(false);
    expect(limiter.isLimited("a", 2)).toBe(true);
  });

  it("counts each key separately", () => {
    const limiter = createRateLimiter(options);

    limiter.isLimited("a", 0);
    limiter.isLimited("a", 1);

    expect(limiter.isLimited("b", 2)).toBe(false);
  });

  it("allows requests again once the window has passed", () => {
    const limiter = createRateLimiter(options);

    limiter.isLimited("a", 0);
    limiter.isLimited("a", 1);

    expect(limiter.isLimited("a", 1001)).toBe(false);
  });

  it("clears expired keys rather than growing when full", () => {
    const limiter = createRateLimiter(options);

    limiter.isLimited("a", 0);
    limiter.isLimited("b", 0);
    limiter.isLimited("c", 0);
    limiter.isLimited("d", 2000);

    expect(limiter.trackedKeys).toBe(1);
  });

  it("never tracks more than the maximum, dropping the least recently seen", () => {
    const limiter = createRateLimiter(options);

    limiter.isLimited("a", 0);
    limiter.isLimited("a", 1);
    limiter.isLimited("b", 2);
    limiter.isLimited("c", 3);
    limiter.isLimited("d", 4);

    expect(limiter.trackedKeys).toBe(3);
    expect(limiter.isLimited("b", 5)).toBe(false);
    // "a" was dropped to make room, so its count started again.
    expect(limiter.isLimited("a", 6)).toBe(false);
  });
});
