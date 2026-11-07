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
  website: string;
  changes: string;
  support: string;
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
