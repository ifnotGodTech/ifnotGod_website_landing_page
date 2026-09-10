import { describe, expect, it } from "vitest";
import { parseContactSubmission } from "./contact";

const validPayload = {
  fullName: "Ada Obi",
  organisation: "Obi Logistics",
  email: "ada@obilogistics.com",
  phone: "+2348012345678",
  challenge: "Our dispatch process is entirely manual and error-prone.",
  desiredOutcome: "Automated dispatch assignment.",
};

describe("parseContactSubmission", () => {
  it("accepts a fully valid submission", () => {
    const result = parseContactSubmission(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts a submission with only the required fields", () => {
    const result = parseContactSubmission({
      fullName: "Ada Obi",
      email: "ada@obilogistics.com",
      challenge: "Our dispatch process is entirely manual and error-prone.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing full name", () => {
    const result = parseContactSubmission({ ...validPayload, fullName: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fullName).toBeDefined();
    }
  });

  it("rejects a malformed email", () => {
    const result = parseContactSubmission({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
    }
  });

  it("rejects a challenge that is too short", () => {
    const result = parseContactSubmission({ ...validPayload, challenge: "too short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.challenge).toBeDefined();
    }
  });

  it("rejects a completely empty payload", () => {
    const result = parseContactSubmission({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fullName).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.challenge).toBeDefined();
    }
  });
});
