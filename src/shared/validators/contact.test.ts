import { describe, expect, it } from "vitest";
import { parseContactSubmission, parsePlanParam } from "./contact";

const validPayload = {
  fullName: "Ada Obi",
  organisation: "Obi Logistics",
  email: "ada@obilogistics.com",
  phone: "+2348012345678",
  challenge: "Our dispatch process is entirely manual and error-prone.",
  plan: "growth",
};

describe("parseContactSubmission", () => {
  it("accepts a fully valid submission", () => {
    const result = parseContactSubmission(validPayload);

    expect(result).toEqual({ success: true, data: validPayload });
  });

  it("accepts a submission with only the required fields", () => {
    const result = parseContactSubmission({
      fullName: "Ada Obi",
      email: "ada@obilogistics.com",
      challenge: "Our dispatch process is entirely manual and error-prone.",
    });
    expect(result.success).toBe(true);
  });

  it("treats 'Not sure yet' as no plan", () => {
    const result = parseContactSubmission({ ...validPayload, plan: "" });

    expect(result.success && result.data.plan).toBeUndefined();
  });

  it("rejects a plan that isn't on offer", () => {
    const result = parseContactSubmission({ ...validPayload, plan: "platinum" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.plan).toBe("Choose a plan from the list.");
    }
  });

  it("drops fields it doesn't know, such as ones sent by the old form", () => {
    const result = parseContactSubmission({ ...validPayload, desiredOutcome: "Automated dispatch." });

    expect(result.success && result.data).not.toHaveProperty("desiredOutcome");
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

describe("parsePlanParam", () => {
  it.each(["starter", "growth", "pro", "custom"])("reads %s", (plan) => {
    expect(parsePlanParam(plan)).toBe(plan);
  });

  it.each([undefined, "", "platinum", ["growth", "pro"], "GROWTH"])("ignores %j", (value) => {
    expect(parsePlanParam(value)).toBeUndefined();
  });
});
