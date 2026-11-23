import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "./robots";

describe("robots.txt", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("lets search engines index the live site, with its sitemap", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "www.ifnotgod.com");

    expect(robots()).toMatchObject({ rules: { userAgent: "*", allow: "/" }, sitemap: expect.stringMatching(/\/sitemap\.xml$/) });
  });

  it("keeps the staging project out of search results", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "staging.ifnotgod.com");

    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });

  it("keeps previews out of search results", () => {
    vi.stubEnv("VERCEL_ENV", "preview");

    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });
});
