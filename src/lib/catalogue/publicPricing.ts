import { chargesSetupFee, paymentOptions, planTerms } from "@/lib/accounts/billing";
import type { CatalogueData } from "@/types/catalogue";
import { buildPlanChoices, formatNaira, listedServices, planHighlights, servicePlansLabel } from "./rules";

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

/** A service on offer, with the problem it solves in a client's own words, as on the Services page. */
export type PublicService = {
  name: string;
  /** Its group, such as "Everyday automations". */
  type: string;
  solves: string;
  /** As the Services page puts it, such as "From Starter". */
  availableOn: string;
  /** Every plan that can include it. Custom can include any service. */
  includedIn: string[];
  note?: string;
};

/** One way of paying, with the offer the team has set for it today. */
export type PublicPaymentOption = {
  period: string;
  label: string;
  months: number;
  /** Months free on this payment, such as 2 on 12 months upfront. */
  freeMonths: number;
  setupFeeWaived: boolean;
  /** The setup fee, in naira, added to a client's first subscription paid this way. 0 when waived or removed. */
  setupFee: number;
};

export type PublicPricing = {
  company: string;
  currency: "NGN";
  plans: PublicPlan[];
  services: PublicService[];
  billingTerms: { setupFee: number; paymentOptions: PublicPaymentOption[] };
  terms: string[];
  links: { pricing: string; services: string; audit: string };
};

export function buildPublicPricing({ plans, groups, services, billingTerms }: CatalogueData, siteUrl: string): PublicPricing {
  const planChoices = plans.map((plan) => ({ plan, choices: buildPlanChoices(plan, groups, services) }));

  // Only services on offer: available, in a group that's shown, and not the "anything else" entry.
  const offered = listedServices(services.filter((service) => service.available)).flatMap((service) => {
    const group = groups.find((item) => item.id === service.group);
    if (!group) return [];
    const includedIn = planChoices
      .filter(({ choices }) => choices.some((choice) => choice.services.some((item) => item.id === service.id)))
      .map(({ plan }) => plan.name);
    return [
      {
        name: service.name,
        type: group.name,
        solves: service.problem,
        availableOn: servicePlansLabel(service, plans),
        includedIn,
        ...(service.note ? { note: service.note } : {}),
      },
    ];
  });

  return {
    company: "IFNOTGOD TECH LTD",
    currency: "NGN",
    plans: planChoices.map(({ plan, choices }) => {
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
    services: offered,
    billingTerms: {
      setupFee: billingTerms.setupFee,
      paymentOptions: paymentOptions(billingTerms).map((option) => ({
        period: option.period,
        label: option.label,
        months: option.months,
        freeMonths: option.freeMonths,
        setupFeeWaived: option.setupFeeWaived,
        setupFee: chargesSetupFee(option.period, billingTerms, false) ? billingTerms.setupFee : 0,
      })),
    },
    terms: planTerms(billingTerms),
    links: { pricing: `${siteUrl}/pricing`, services: `${siteUrl}/services`, audit: `${siteUrl}/audit` },
  };
}
