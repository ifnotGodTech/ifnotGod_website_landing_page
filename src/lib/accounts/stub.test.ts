import { describe, expect, it } from "vitest";
import { createStubBackend, STUB_RULES } from "./stub";

const backend = createStubBackend();

describe("stand-in account backend", () => {
  it("signs up anyone except the taken email", async () => {
    expect(await backend.signUp({ fullName: "Ada Obi", email: "ada@example.com", password: "long enough" })).toMatchObject({
      ok: true,
      value: { fullName: "Ada Obi", email: "ada@example.com", signInMethod: "password" },
    });
    expect(await backend.signUp({ fullName: "A", email: STUB_RULES.takenEmail, password: "x" })).toEqual({
      ok: false,
      error: "EMAIL_TAKEN",
    });
  });

  it("logs in any email, naming the user from it", async () => {
    const result = await backend.logIn({ email: "ada.obi@example.com", password: "anything" });

    expect(result).toMatchObject({ ok: true, value: { fullName: "Ada Obi", email: "ada.obi@example.com" } });
  });

  it("refuses the wrong password and the locked email", async () => {
    expect(await backend.logIn({ email: "ada@example.com", password: STUB_RULES.wrongPassword })).toEqual({
      ok: false,
      error: "INVALID_CREDENTIALS",
    });
    expect(await backend.logIn({ email: STUB_RULES.lockedEmail, password: "anything" })).toEqual({
      ok: false,
      error: "TOO_MANY_ATTEMPTS",
    });
  });

  it("gives the same user id for the same email, whatever its case", async () => {
    const a = await backend.logIn({ email: "Ada@Example.com", password: "x" });
    const b = await backend.logIn({ email: "ada@example.com", password: "x" });

    expect(a.ok && b.ok && a.value.id === b.value.id).toBe(true);
  });

  it("signs in a sample Google user, and accepts any reset request", async () => {
    expect(await backend.signInWithGoogle()).toMatchObject({ ok: true, value: { signInMethod: "google" } });
    expect(await backend.requestPasswordReset("anyone@example.com")).toEqual({ ok: true, value: null });
  });
});
