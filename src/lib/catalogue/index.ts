import { PLANS } from "@/content/plans";
import { SERVICE_GROUPS, SERVICES } from "@/content/services";
import type { Plan, PlanChoice, PlanId, ServiceGroupWithServices } from "@/types/catalogue";
import { buildPlanChoices } from "./rules";

// The only module that reads the content files. These functions are async so the
// backend API can replace the content files later without changing any page.

export async function getPlans(): Promise<Plan[]> {
  return PLANS;
}

export async function getPlan(id: PlanId): Promise<Plan | undefined> {
  return PLANS.find((plan) => plan.id === id);
}

export async function getServiceGroups(): Promise<ServiceGroupWithServices[]> {
  return SERVICE_GROUPS.map((group) => ({
    ...group,
    services: SERVICES.filter((service) => service.available && service.group === group.id),
  })).filter((group) => group.services.length > 0);
}

export async function getPlanChoices(id: PlanId): Promise<PlanChoice[]> {
  const plan = await getPlan(id);
  return plan ? buildPlanChoices(plan, SERVICE_GROUPS, SERVICES) : [];
}
