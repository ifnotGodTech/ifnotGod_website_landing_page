import { planTerms } from "@/lib/accounts/billing";
import type { BillingTerms, CatalogueData } from "@/types/catalogue";
import { buildPlanChoices, formatNaira, planHighlights } from "./rules";

// What /api/pricing returns: the same plans, prices and terms the pricing page shows, for our AI
// assistant (n8n) and anything else that needs today's prices. Public information only.

export type PublicPlan = {
  id: string;
  name: string;
  /** Naira a month, or null when it's quoted after the free audit. */
  monthlyPrice: number | null;
  price: string;
  recommended: boolean;
  summary: string;
  includes: string[];
  choices: { label: string; chooseFrom: string[] }[];
  changes: string;
  alsoIncluded: string[];
};

export type PublicPricing = {
  company: string;
  currency: "NGN";
  plans: PublicPlan[];
  billingTerms: BillingTerms;
  terms: string[];
  links: { pricing: string; services: string; audit: string };
};

export function buildPublicPricing({ plans, groups, services, billingTerms }: CatalogueData, siteUrl: string): PublicPricing {
  return {
    company: "IFNOTGOD TECH LTD",
    currency: "NGN",
    plans: plans.map((plan) => {
      const choices = buildPlanChoices(plan, groups, services);
      return {
        id: plan.id,
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        price: plan.monthlyPrice === null ? "Quoted after the free audit" : `${formatNaira(plan.monthlyPrice)} a month`,
        recommended: plan.recommended,
        summary: plan.summary,
        includes: planHighlights(plan, choices),
        choices: choices.map((choice) => ({
          label: choice.label,
          chooseFrom: choice.services.filter((service) => !service.catchAll).map((service) => service.name),
        })),
        changes: plan.changes,
        alsoIncluded: plan.lines,
      };
    }),
    billingTerms,
    terms: planTerms(billingTerms),
    links: { pricing: `${siteUrl}/pricing`, services: `${siteUrl}/services`, audit: `${siteUrl}/audit` },
  };
}
