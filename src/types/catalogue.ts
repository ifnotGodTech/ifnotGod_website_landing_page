export type PlanId = "starter" | "growth" | "pro" | "custom";

export type ServiceGroupId = "everyday" | "social" | "agents";

/** How many services a client can choose from a group. "agreed" means set per client. */
export type Allowance = number | "agreed";

export type Plan = {
  id: PlanId;
  name: string;
  /** In naira. Null when the price is quoted after the audit. */
  monthlyPrice: number | null;
  tag: string;
  summary: string;
  ctaLabel: string;
  recommended: boolean;
  allowances: Record<ServiceGroupId, Allowance>;
  /** A service to name as an example in the plan's summary, shown only while it's on offer. */
  highlightExample?: { serviceId: string; label: string };
  website: string;
  changes: string;
  /** Changes or service swaps a month. "agreed" means set per client. */
  monthlyChanges: number | "agreed";
  support: string;
};

export type BillingTerms = {
  /** In naira, charged once on a client's first monthly subscription. */
  setupFee: number;
  /** Paying at least this many months upfront waives the setup fee. */
  setupFeeWaivedFromMonths: number;
  /** Free months when paying 12 months upfront. */
  freeMonthsOnTwelve: number;
};

export type ServiceGroup = {
  id: ServiceGroupId;
  name: string;
  unitSingular: string;
  unitPlural: string;
};

export type Service = {
  id: string;
  group: ServiceGroupId;
  name: string;
  /** The problem in the client's own words, without quotation marks. */
  problem: string;
  /** The lowest plan that includes this service. Higher plans include it too. */
  includedFrom: PlanId;
  /** When false, the service doesn't appear anywhere on the site. */
  available: boolean;
  note?: string;
  /** Stands for "anything else", so it's offered in plans but not listed as a service of its own. */
  catchAll?: boolean;
};

export type ServiceGroupWithServices = ServiceGroup & {
  services: Service[];
};

/** One group of services a plan can choose from. */
export type PlanChoice = {
  group: ServiceGroup;
  allowance: Allowance;
  label: string;
  services: Service[];
};
