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

  it("gives the setup fee and upfront offers as numbers and in words", () => {
    expect(pricing.billingTerms).toEqual(BILLING_TERMS);
    expect(pricing.terms[0]).toBe("One-time setup fee of ₦100,000, waived when you pay 6 or 12 months upfront.");
    expect(pricing.terms).toContain("Pay 12 months upfront and get 2 months free.");
  });

  it("follows the terms the team saves", () => {
    const changed = buildPublicPricing(
      { ...catalogue, billingTerms: { setupFee: 50_000, setupFeeWaivedFromMonths: 12, freeMonthsOnTwelve: 0 } },
      "https://www.ifnotgod.com"
    );
    expect(changed.terms[0]).toBe("One-time setup fee of ₦50,000, waived when you pay 12 months upfront.");
    expect(changed.terms.some((term) => term.includes("months free"))).toBe(false);
  });

  it("links to the site's own pages", () => {
    expect(pricing.links).toEqual({
      pricing: "https://www.ifnotgod.com/pricing",
      services: "https://www.ifnotgod.com/services",
      audit: "https://www.ifnotgod.com/audit",
    });
  });
});
