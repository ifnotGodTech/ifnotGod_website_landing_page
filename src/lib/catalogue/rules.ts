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

export function isIncludedInPlan(service: Service, planId: PlanId): boolean {
  return PLAN_ORDER.indexOf(planId) >= PLAN_ORDER.indexOf(service.includedFrom);
}

export function allowanceLabel(group: ServiceGroup, allowance: Allowance): string {
  if (allowance === "agreed") return group.name;
  return `${allowance} ${allowance === 1 ? group.unitSingular : group.unitPlural}`;
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
