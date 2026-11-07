import type { Allowance, Plan, PlanChoice, PlanId, Service, ServiceGroup } from "@/types/catalogue";

const PLAN_ORDER: readonly PlanId[] = ["starter", "growth", "pro", "custom"];

const nairaFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(amount: number): string {
  return nairaFormat.format(amount);
}

export function formatPlanPrice(plan: Plan): string {
  return plan.monthlyPrice === null ? "Let's talk" : `${formatNaira(plan.monthlyPrice)} / month`;
}

export function isIncludedInPlan(service: Service, planId: PlanId): boolean {
  return PLAN_ORDER.indexOf(planId) >= PLAN_ORDER.indexOf(service.includedFrom);
}

export function allowanceLabel(group: ServiceGroup, allowance: Allowance): string {
  if (allowance === "agreed") return group.name;
  return `${allowance} ${allowance === 1 ? group.unitSingular : group.unitPlural}`;
}

/** Services to list individually, leaving out the catch-all entry. */
export function listedServices(services: Service[]): Service[] {
  return services.filter((service) => !service.catchAll);
}

/** For example, "From Growth". */
export function lowestPlanLabel(service: Service, plans: Plan[]): string {
  const plan = plans.find((candidate) => candidate.id === service.includedFrom);
  return plan ? `From ${plan.name}` : "";
}

/** For example, "Starter includes 1, Growth 3, Pro 6". Leaves out plans with none or an agreed number. */
export function groupAllowanceSummary(group: ServiceGroup, plans: Plan[]): string {
  return plans
    .flatMap((plan) => {
      const allowance = plan.allowances[group.id];
      return typeof allowance === "number" && allowance > 0 ? [{ name: plan.name, allowance }] : [];
    })
    .map(({ name, allowance }, index) => (index === 0 ? `${name} includes ${allowance}` : `${name} ${allowance}`))
    .join(", ");
}

/** The short list of what a plan includes, for plan summaries. */
export function planHighlights(plan: Plan, choices: PlanChoice[]): string[] {
  if (plan.monthlyPrice === null) return ["Everything agreed around your needs", plan.website, plan.tag];

  const example = plan.highlightExample;
  const labels = choices.map((choice) =>
    example && choice.services.some((service) => service.id === example.serviceId)
      ? `${choice.label}, such as ${example.label}`
      : choice.label
  );
  return [...labels, plan.website];
}

/** What a plan can choose from, leaving out services that aren't available and groups with nothing to offer. */
export function buildPlanChoices(plan: Plan, groups: ServiceGroup[], services: Service[]): PlanChoice[] {
  return groups.flatMap((group) => {
    const allowance = plan.allowances[group.id];
    if (allowance === 0) return [];

    const choices = services.filter(
      (service) => service.available && service.group === group.id && isIncludedInPlan(service, plan.id)
    );
    if (choices.length === 0) return [];

    return [{ group, allowance, label: allowanceLabel(group, allowance), services: choices }];
  });
}
