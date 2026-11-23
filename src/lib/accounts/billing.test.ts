import { describe, expect, it } from "vitest";
import { getBillingTerms, getPlan } from "@/lib/catalogue";
import { buildQuote, describeBillingTerms, isBillingPeriod } from "./billing";

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

  it("gives 2 months free for 12 months upfront, and charges the setup fee", () => {
    const quote = buildQuote(growth, "twelve-months", BILLING_TERMS);

    expect(quote.dueToday).toBe(500_000);
    expect(quote.lines).toEqual([
      { label: "Growth, 12 months", amount: "₦480,000" },
      { label: "2 months free", amount: "−₦80,000" },
      { label: "One-time setup fee", amount: "₦100,000" },
    ]);
    expect(quote.optionNote).toBe("2 months free, plus a one-time setup fee of ₦100,000.");
  });

  it("doesn't charge the setup fee twice on 12 months upfront", () => {
    const quote = buildQuote(growth, "twelve-months", BILLING_TERMS, { setupFeePaid: true });

    expect(quote.dueToday).toBe(400_000);
    expect(quote.lines.some((line) => line.label.toLowerCase().includes("setup fee"))).toBe(false);
    expect(quote.optionNote).toBe("2 months free.");
  });

  it("follows the terms the team sets: a lower fee, no fee, a waiver only for 12 months, and 1 free month", () => {
    const lower = buildQuote(growth, "monthly", { ...BILLING_TERMS, setupFee: 50_000 });
    const none = buildQuote(growth, "monthly", { ...BILLING_TERMS, setupFee: 0 });
    const sixPays = buildQuote(growth, "six-months", { ...BILLING_TERMS, setupFeeWaivedFromMonths: 12 });
    const oneFree = buildQuote(growth, "twelve-months", { ...BILLING_TERMS, freeMonthsOnTwelve: 1 });
    const noOffers = buildQuote(growth, "twelve-months", { setupFee: 0, setupFeeWaivedFromMonths: 6, freeMonthsOnTwelve: 0 });

    expect([lower.dueToday, lower.optionNote]).toEqual([90_000, "Plus a one-time setup fee of ₦50,000. Cancel any time."]);
    expect([none.dueToday, none.optionNote, none.lines.length]).toEqual([40_000, "Cancel any time.", 1]);
    expect([sixPays.dueToday, sixPays.optionNote]).toEqual([340_000, "Plus a one-time setup fee of ₦100,000."]);
    expect(oneFree.lines).toContainEqual({ label: "1 month free", amount: "−₦40,000" });
    expect(oneFree.optionNote).toBe("1 month free, and no setup fee.");
    expect([noOffers.dueToday, noOffers.optionNote, noOffers.lines.length]).toEqual([480_000, "Cancel any time.", 1]);
  });

  it("describes the terms for the pricing page", () => {
    expect(describeBillingTerms(BILLING_TERMS)).toEqual({
      setupFee: "One-time setup fee of ₦100,000, waived when you pay 6 or 12 months upfront.",
      freeMonths: "Pay 12 months upfront and get 2 months free.",
    });
    expect(describeBillingTerms({ setupFee: 0, setupFeeWaivedFromMonths: 12, freeMonthsOnTwelve: 0 })).toEqual({ setupFee: "No setup fee.", freeMonths: null });
    expect(describeBillingTerms({ setupFee: 25_000, setupFeeWaivedFromMonths: 12, freeMonthsOnTwelve: 1 })).toEqual({
      setupFee: "One-time setup fee of ₦25,000, waived when you pay 12 months upfront.",
      freeMonths: "Pay 12 months upfront and get 1 month free.",
    });
  });

  it("recognises billing periods", () => {
    expect(isBillingPeriod("six-months")).toBe(true);
    expect(isBillingPeriod("weekly")).toBe(false);
  });
});
