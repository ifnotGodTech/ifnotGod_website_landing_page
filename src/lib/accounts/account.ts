import { getBillingTerms, getPlan, getPlanChoices, getPlans } from "@/lib/catalogue";
import type { Payment, Subscription } from "@/types/account";
import type { Plan, PlanChoice } from "@/types/catalogue";
import { getAccountSubscription, getPayments } from "./subscriptions";
import { selfServiceChoices } from "./serviceSelection";

export type AccountOverview = {
  subscription: Subscription | null;
  plan: Plan | null;
  pendingPlan: Plan | null;
  choices: PlanChoice[];
  payments: Payment[];
  setupFeePaid: boolean;
};

/** Everything an account page needs about the signed-in client. Throws if the backend can't be reached. */
export async function loadAccount(token: string): Promise<AccountOverview> {
  const [account, payments] = await Promise.all([getAccountSubscription(token), getPayments(token)]);
  if (!account.ok || !payments.ok) throw new Error("The account backend couldn't be reached.");

  const { subscription, setupFeePaid } = account.value;
  const current = subscription;
  const plan = current ? ((await getPlan(current.planId)) ?? null) : null;
  return {
    subscription: current,
    plan,
    pendingPlan: current?.pendingPlanId ? ((await getPlan(current.pendingPlanId)) ?? null) : null,
    choices: plan ? selfServiceChoices(await getPlanChoices(plan.id)) : [],
    payments: payments.value,
    setupFeePaid,
  };
}

/** Plans a client can buy online: everything with a published price. */
export async function getSubscribablePlans(): Promise<Plan[]> {
  return (await getPlans()).filter((plan) => plan.monthlyPrice !== null);
}

export { getBillingTerms };
