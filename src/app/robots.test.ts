import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "./robots";

describe("robots.txt", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("lets search engines index the live site, with its sitemap", () => {
    vi.stubEnv("VERCEL_ENV", "production");

    expect(robots()).toMatchObject({ rules: { userAgent: "*", allow: "/" }, sitemap: expect.stringMatching(/\/sitemap\.xml$/) });
  });

  it("keeps previews, including staging, out of search results", () => {
    vi.stubEnv("VERCEL_ENV", "preview");

    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });
});
