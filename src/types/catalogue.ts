export type PlanId = "starter" | "growth" | "pro" | "custom";

/** Groups are records the team can add, so their ids are open-ended. */
export type ServiceGroupId = string;

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
  /** By group id. A group missing here counts as none. */
  allowances: Record<ServiceGroupId, Allowance>;
  /** A service to name as an example in the plan's summary, shown only while it's on offer. */
  highlightExample?: { serviceId: string; label: string };
  /** How changes are described, such as "1 change or new build a month". */
  changes: string;
  /** Other things the plan lists, in order. The first is the website we build. */
  lines: string[];
  /** Changes or service swaps a month. "agreed" means set per client. */
  monthlyChanges: number | "agreed";
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
  /** Priced plans that include this service. Custom can include any service. */
  plans: PlanId[];
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

/** The home page text the team edits on the dashboard. */
export type SiteText = {
  headline: string;
  introduction: string;
  closingCallToAction: string;
};

/** Everything the catalogue holds, as one load. */
export type CatalogueData = {
  plans: Plan[];
  groups: ServiceGroup[];
  services: Service[];
  billingTerms: BillingTerms;
};
