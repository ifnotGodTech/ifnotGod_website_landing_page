import type { BillingTerms, Plan, PlanChoice, PlanId, ServiceGroupWithServices, SiteText } from "@/types/catalogue";
import { buildPlanChoices } from "./rules";
import { loadCatalogue, loadSiteText } from "./source";

// The only way pages read plans, services and site text. Where they come from is decided in
// ./source, so pages never change when the source does.

export async function getPlans(): Promise<Plan[]> {
  return (await loadCatalogue()).plans;
}

export async function getPlan(id: PlanId): Promise<Plan | undefined> {
  return (await getPlans()).find((plan) => plan.id === id);
}

export async function getServiceGroups(): Promise<ServiceGroupWithServices[]> {
  const { groups, services } = await loadCatalogue();
  return groups
    .map((group) => ({ ...group, services: services.filter((service) => service.available && service.group === group.id) }))
    .filter((group) => group.services.length > 0);
}

export async function getBillingTerms(): Promise<BillingTerms> {
  return (await loadCatalogue()).billingTerms;
}

export async function getPlanChoices(id: PlanId): Promise<PlanChoice[]> {
  const { plans, groups, services } = await loadCatalogue();
  const plan = plans.find((item) => item.id === id);
  return plan ? buildPlanChoices(plan, groups, services) : [];
}

export async function getSiteText(): Promise<SiteText> {
  return loadSiteText();
}
