import { describe, expect, it } from "vitest";
import { isSearchable } from "./indexing";

describe("isSearchable", () => {
  it("indexes the live project's production build", () => {
    expect(isSearchable({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "www.ifnotgod.com" })).toBe(true);
    expect(isSearchable({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "ifnotgod.com" })).toBe(true);
  });

  it("keeps the staging project out of search results", () => {
    expect(isSearchable({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "staging.ifnotgod.com" })).toBe(false);
    expect(isSearchable({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "web-staging.vercel.app" })).toBe(false);
    expect(isSearchable({ VERCEL_ENV: "production" })).toBe(false);
  });

  it("keeps previews out of search results", () => {
    expect(isSearchable({ VERCEL_ENV: "preview", VERCEL_PROJECT_PRODUCTION_URL: "www.ifnotgod.com" })).toBe(false);
  });

  it("indexes local runs, which aren't on Vercel", () => {
    expect(isSearchable({})).toBe(true);
  });
});
