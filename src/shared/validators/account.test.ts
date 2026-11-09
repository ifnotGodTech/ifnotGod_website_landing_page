import { describe, expect, it } from "vitest";
import { logInSchema, parseForm, resetPasswordSchema, signUpSchema } from "./account";

describe("account form validation", () => {
  it("needs an email and password to log in", () => {
    expect(parseForm(logInSchema, { email: "", password: "" })).toEqual({
      success: false,
      errors: { email: "Enter your email address.", password: "Enter your password." },
    });
  });

  it("rejects a malformed email", () => {
    const result = parseForm(logInSchema, { email: "ada@", password: "secret" });

    expect(result.success === false && result.errors.email).toBe("Enter a valid email address.");
  });

  it("asks for a password of at least 10 characters when signing up", () => {
    const result = parseForm(signUpSchema, { fullName: "Ada Obi", email: "ada@example.com", password: "short" });

    expect(result.success === false && result.errors.password).toBe("Use at least 10 characters.");
  });

  it("treats an empty business name as none, and trims names", () => {
    const result = parseForm(signUpSchema, {
      fullName: "  Ada Obi ",
      businessName: "",
      email: "ada@example.com",
      password: "long enough",
    });

    expect(result).toEqual({
      success: true,
      data: { fullName: "Ada Obi", businessName: undefined, email: "ada@example.com", password: "long enough" },
    });
  });

  it("needs a valid email to reset a password", () => {
    expect(parseForm(resetPasswordSchema, { email: "nope" }).success).toBe(false);
  });
});
