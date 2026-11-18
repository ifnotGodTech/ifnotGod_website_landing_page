import type { BillingTerms, Plan } from "@/types/catalogue";

// Listed from lowest to highest, which is also the order shown on the site.
export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 20_000,
    tag: "Fix your first problem",
    summary: "For a business or creator fixing their first problem.",
    ctaLabel: "Start with an audit",
    recommended: false,
    allowances: { everyday: 1, social: 1, agents: 0 },
    changes: "Small fixes and 1 service swap a month",
    lines: ["Landing or link-in-bio page", "Email support"],
    monthlyChanges: 1,
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 40_000,
    tag: "Recommended",
    summary: "For a team ready to automate follow-up, content and sales.",
    ctaLabel: "Start with an audit",
    recommended: true,
    allowances: { everyday: 3, social: 2, agents: 1 },
    changes: "1 change or new build a month",
    lines: ["Landing page with more sections", "Priority WhatsApp support"],
    monthlyChanges: 1,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 80_000,
    tag: "Run several automations",
    summary: "For a busy organisation running several automations and agents.",
    ctaLabel: "Start with an audit",
    recommended: false,
    allowances: { everyday: 6, social: 4, agents: 2 },
    highlightExample: { serviceId: "ai-call-agent", label: "the call agent" },
    changes: "2 changes or new builds a month",
    lines: ["Small multi-page site", "Priority WhatsApp support and a monthly review call"],
    monthlyChanges: 2,
  },
  {
    id: "custom",
    name: "Custom",
    monthlyPrice: null,
    tag: "Quoted after the audit",
    summary: "For larger apps, platforms and anything beyond Pro.",
    ctaLabel: "Talk to us",
    recommended: false,
    allowances: { everyday: "agreed", social: "agreed", agents: "agreed" },
    changes: "Agreed with you",
    lines: ["Larger apps and platforms", "Support agreed with you"],
    monthlyChanges: "agreed",
  },
];

export const BILLING_TERMS: BillingTerms = {
  setupFee: 100_000,
  setupFeeWaivedFromMonths: 6,
  freeMonthsOnTwelve: 2,
};
