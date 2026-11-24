import { describe, expect, it } from "vitest";
import { BILLING_TERMS, PLANS } from "@/content/plans";
import { SERVICE_GROUPS, SERVICES } from "@/content/services";
import { buildPublicPricing } from "./publicPricing";

const catalogue = { plans: PLANS, groups: SERVICE_GROUPS, services: SERVICES, billingTerms: BILLING_TERMS };

describe("buildPublicPricing", () => {
  const pricing = buildPublicPricing(catalogue, "https://www.ifnotgod.com");

  it("lists every plan with its price in naira", () => {
    expect(pricing.currency).toBe("NGN");
    expect(pricing.plans.map((plan) => [plan.name, plan.monthlyPrice, plan.price])).toEqual([
      ["Starter", 20_000, "₦20,000 a month"],
      ["Growth", 40_000, "₦40,000 a month"],
      ["Pro", 80_000, "₦80,000 a month"],
      ["Custom", null, "Quoted after the free audit"],
    ]);
  });

  it("says what each plan includes and what can be chosen", () => {
    const starter = pricing.plans[0];
    expect(starter.includes.length).toBeGreaterThan(0);
    expect(starter.choices.length).toBeGreaterThan(0);
    for (const choice of starter.choices) {
      expect(choice.label).toBeTruthy();
      expect(choice.chooseFrom.length).toBeGreaterThan(0);
    }
    expect(starter.alsoIncluded).toEqual(PLANS[0].lines);
  });

  it("leaves out services taken off the site", () => {
    const hidden = { ...catalogue, services: SERVICES.map((service, index) => (index === 0 ? { ...service, available: false } : service)) };
    const names = buildPublicPricing(hidden, "https://www.ifnotgod.com").plans.flatMap((plan) => plan.choices.flatMap((choice) => choice.chooseFrom));
    expect(names).not.toContain(SERVICES[0].name);
  });

  it("lists each service with the problem it solves and the plans that include it", () => {
    const listed = SERVICES.filter((service) => service.available && !service.catchAll);
    expect(pricing.services.map((service) => service.name)).toEqual(listed.map((service) => service.name));

    const first = listed[0];
    const service = pricing.services[0];
    expect(service.solves).toBe(first.problem);
    expect(service.type).toBe(SERVICE_GROUPS.find((group) => group.id === first.group)?.name);
    expect(service.availableOn).toMatch(/^(From|In) |only$/);
    expect(service.includedIn).toContain("Custom");
    for (const planName of service.includedIn.filter((name) => name !== "Custom")) {
      const plan = pricing.plans.find((item) => item.name === planName)!;
      expect(plan.choices.some((choice) => choice.chooseFrom.includes(service.name))).toBe(true);
    }
  });

  it("leaves services taken off the site out of the services list", () => {
    const hidden = { ...catalogue, services: SERVICES.map((service, index) => (index === 0 ? { ...service, available: false } : service)) };
    const names = buildPublicPricing(hidden, "https://www.ifnotgod.com").services.map((service) => service.name);
    expect(names).not.toContain(SERVICES[0].name);
  });

  it("gives the setup fee and each way of paying's offer as numbers and in words", () => {
    expect(pricing.billingTerms).toEqual({
      setupFee: 100_000,
      paymentOptions: [
        { period: "monthly", label: "Monthly", months: 1, freeMonths: 0, setupFeeWaived: false, setupFee: 100_000 },
        { period: "six-months", label: "6 months upfront", months: 6, freeMonths: 0, setupFeeWaived: true, setupFee: 0 },
        { period: "twelve-months", label: "12 months upfront", months: 12, freeMonths: 2, setupFeeWaived: false, setupFee: 100_000 },
      ],
    });
    expect(pricing.terms[0]).toBe("One-time setup fee of ₦100,000, waived when you pay 6 months upfront.");
    expect(pricing.terms).toContain("Pay 12 months upfront and get 2 months free. The setup fee still applies.");
  });

  it("follows a promotion the team saves", () => {
    const changed = buildPublicPricing(
      { ...catalogue, billingTerms: { ...BILLING_TERMS, monthlySetupFeeWaived: true, twelveMonthsFreeMonths: 3 } },
      "https://www.ifnotgod.com"
    );
    expect(changed.billingTerms.paymentOptions[0]).toMatchObject({ setupFeeWaived: true, setupFee: 0 });
    expect(changed.terms[0]).toBe("One-time setup fee of ₦100,000, waived when you pay monthly or 6 months upfront.");
    expect(changed.terms).toContain("Pay 12 months upfront and get 3 months free. The setup fee still applies.");
  });

  it("links to the site's own pages", () => {
    expect(pricing.links).toEqual({
      pricing: "https://www.ifnotgod.com/pricing",
      services: "https://www.ifnotgod.com/services",
      audit: "https://www.ifnotgod.com/audit",
    });
  });
});
