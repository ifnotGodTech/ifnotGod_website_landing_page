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

  it("follows the terms the team sets for each way of paying", () => {
    const lower = buildQuote(growth, "monthly", { ...BILLING_TERMS, setupFee: 50_000 });
    const none = buildQuote(growth, "monthly", { ...BILLING_TERMS, setupFee: 0 });
    const monthlyPromotion = buildQuote(growth, "monthly", { ...BILLING_TERMS, monthlySetupFeeWaived: true });
    const sixPays = buildQuote(growth, "six-months", { ...BILLING_TERMS, sixMonthsSetupFeeWaived: false });
    const sixOneFree = buildQuote(growth, "six-months", { ...BILLING_TERMS, sixMonthsFreeMonths: 1 });
    const twelveWaived = buildQuote(growth, "twelve-months", { ...BILLING_TERMS, twelveMonthsSetupFeeWaived: true, twelveMonthsFreeMonths: 1 });
    const noOffers = buildQuote(growth, "twelve-months", { ...BILLING_TERMS, setupFee: 0, twelveMonthsFreeMonths: 0 });

    expect([lower.dueToday, lower.optionNote]).toEqual([90_000, "Plus a one-time setup fee of ₦50,000. Cancel any time."]);
    expect([none.dueToday, none.optionNote, none.lines.length]).toEqual([40_000, "Cancel any time.", 1]);
    expect([monthlyPromotion.dueToday, monthlyPromotion.optionNote]).toEqual([40_000, "No setup fee. Cancel any time."]);
    expect(monthlyPromotion.lines).toContainEqual({ label: "Setup fee", amount: "Waived" });
    expect([sixPays.dueToday, sixPays.optionNote]).toEqual([340_000, "Plus a one-time setup fee of ₦100,000."]);
    expect([sixOneFree.dueToday, sixOneFree.optionNote]).toEqual([200_000, "1 month free, and no setup fee."]);
    expect(twelveWaived.lines).toContainEqual({ label: "1 month free", amount: "−₦40,000" });
    expect([twelveWaived.dueToday, twelveWaived.optionNote]).toEqual([440_000, "1 month free, and no setup fee."]);
    expect([noOffers.dueToday, noOffers.optionNote, noOffers.lines.length]).toEqual([480_000, "Cancel any time.", 1]);
  });

  it("describes today's terms for the pricing page, as the live site words them", () => {
    expect(describeBillingTerms(BILLING_TERMS)).toEqual({
      setupFee: "One-time setup fee of ₦100,000, waived when you pay 6 months upfront.",
      offers: ["Pay 12 months upfront and get 2 months free. The setup fee still applies."],
    });
  });

  it("describes promotions", () => {
    expect(describeBillingTerms({ ...BILLING_TERMS, setupFee: 0, twelveMonthsFreeMonths: 0 })).toEqual({ setupFee: "No setup fee.", offers: [] });
    expect(
      describeBillingTerms({ ...BILLING_TERMS, monthlySetupFeeWaived: true, twelveMonthsSetupFeeWaived: true, sixMonthsSetupFeeWaived: true })
    ).toEqual({ setupFee: "No setup fee.", offers: ["Pay 12 months upfront and get 2 months free."] });
    expect(describeBillingTerms({ ...BILLING_TERMS, setupFee: 25_000, monthlySetupFeeWaived: true, sixMonthsFreeMonths: 1 })).toEqual({
      setupFee: "One-time setup fee of ₦25,000, waived when you pay monthly or 6 months upfront.",
      offers: ["Pay 6 months upfront and get 1 month free.", "Pay 12 months upfront and get 2 months free. The setup fee still applies."],
    });
    expect(describeBillingTerms({ ...BILLING_TERMS, sixMonthsSetupFeeWaived: false }).setupFee).toBe("One-time setup fee of ₦100,000 on your first subscription.");
  });

  it("recognises billing periods", () => {
    expect(isBillingPeriod("six-months")).toBe(true);
    expect(isBillingPeriod("weekly")).toBe(false);
  });
});
