import { describe, expect, it } from "vitest";
import { forAnalytics, withoutPrivateDetails } from "./analytics";

describe("withoutPrivateDetails", () => {
  it.each([
    ["https://www.ifnotgod.com/reset-password/new?uid=MQ&token=abc-123", "https://www.ifnotgod.com/reset-password/new"],
    [
      "https://www.ifnotgod.com/account/subscribe/paid?status=successful&tx_ref=IFNG-1&transaction_id=777",
      "https://www.ifnotgod.com/account/subscribe/paid",
    ],
    ["https://www.ifnotgod.com/login/google/callback?code=4/0Ab&state=xyz", "https://www.ifnotgod.com/login/google/callback"],
    ["https://www.ifnotgod.com/pricing#plans", "https://www.ifnotgod.com/pricing"],
    ["https://www.ifnotgod.com/", "https://www.ifnotgod.com/"],
  ])("keeps only the page of %s", (url, expected) => {
    expect(withoutPrivateDetails(url)).toBe(expected);
  });

  it("still strips the details from an address it can't parse", () => {
    expect(withoutPrivateDetails("/reset-password/new?token=abc")).toBe("/reset-password/new");
  });
});

describe("forAnalytics", () => {
  it("keeps the event and changes only its address", () => {
    expect(forAnalytics({ type: "pageview" as const, url: "https://www.ifnotgod.com/login?next=/account" })).toEqual({
      type: "pageview",
      url: "https://www.ifnotgod.com/login",
    });
  });
});
