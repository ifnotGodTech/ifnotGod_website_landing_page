import { describe, expect, it } from "vitest";
import { getBillingTerms, getPlan } from "@/lib/catalogue";
import { buildQuote, isBillingPeriod } from "./billing";

const growth = (await getPlan("growth"))!;
const BILLING_TERMS = await getBillingTerms();

describe("buildQuote", () => {
  it("adds the setup fee to a first monthly payment", () => {
    const quote = buildQuote(growth, "monthly", BILLING_TERMS);

    expect(quote.dueToday).toBe(140_000);
    expect(quote.lines).toEqual([
      { label: "Growth, first month", amount: "₦40,000" },
      { label: "One-time setup fee", amount: "₦100,000" },
    ]);
    expect(quote.renewalNote).toMatch(/Then ₦40,000 a month. Your plan renews automatically each month/);
  });

  it("never charges the setup fee twice", () => {
    const quote = buildQuote(growth, "monthly", BILLING_TERMS, { setupFeePaid: true });

    expect(quote.dueToday).toBe(40_000);
    expect(quote.lines.map((line) => line.label)).toEqual(["Growth, first month"]);
  });

  it("waives the setup fee for 6 months upfront", () => {
    const quote = buildQuote(growth, "six-months", BILLING_TERMS);

    expect(quote.dueToday).toBe(240_000);
    expect(quote.lines).toContainEqual({ label: "Setup fee", amount: "Waived" });
  });

  it("gives 2 months free and no setup fee for 12 months upfront", () => {
    const quote = buildQuote(growth, "twelve-months", BILLING_TERMS);

    expect(quote.dueToday).toBe(400_000);
    expect(quote.lines).toEqual([
      { label: "Growth, 12 months", amount: "₦480,000" },
      { label: "2 months free", amount: "−₦80,000" },
      { label: "Setup fee", amount: "Waived" },
    ]);
    expect(quote.optionNote).toBe("2 months free, and no setup fee.");
  });

  it("recognises billing periods", () => {
    expect(isBillingPeriod("six-months")).toBe(true);
    expect(isBillingPeriod("weekly")).toBe(false);
  });
});
