import { describe, expect, it } from "vitest";
import { safeNextPath, withNext } from "./paths";

describe("safeNextPath", () => {
  it.each(["/account", "/account/services", "/pricing?plan=pro"])("keeps the site path %s", (path) => {
    expect(safeNextPath(path)).toBe(path);
  });

  it.each([undefined, "", "account", "https://evil.example", "//evil.example", "/\\evil.example", ["/a", "/b"]])(
    "falls back to the account page for %j",
    (value) => {
      expect(safeNextPath(value)).toBe("/account");
    }
  );
});

describe("withNext", () => {
  it("adds where to go after logging in, unless it's the account page", () => {
    expect(withNext("/login", "/account/services")).toBe("/login?next=%2Faccount%2Fservices");
    expect(withNext("/login", "/account")).toBe("/login");
  });
});
