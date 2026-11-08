import { getBillingTerms, getPlan, getPlanChoices, getPlans } from "@/lib/catalogue";
import type { AccountUser, Payment, Subscription } from "@/types/account";
import type { Plan, PlanChoice } from "@/types/catalogue";
import { getAccountsBackend } from "./index";
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
export async function loadAccount(user: AccountUser): Promise<AccountOverview> {
  const backend = getAccountsBackend();
  const [subscription, payments, setupFeePaid] = await Promise.all([
    backend.getSubscription(user),
    backend.getPayments(user),
    backend.hasPaidSetupFee(user),
  ]);
  if (!subscription.ok || !payments.ok || !setupFeePaid.ok) throw new Error("The account backend couldn't be reached.");

  const current = subscription.value;
  const plan = current ? ((await getPlan(current.planId)) ?? null) : null;
  return {
    subscription: current,
    plan,
    pendingPlan: current?.pendingPlanId ? ((await getPlan(current.pendingPlanId)) ?? null) : null,
    choices: plan ? selfServiceChoices(await getPlanChoices(plan.id)) : [],
    payments: payments.value,
    setupFeePaid: setupFeePaid.value,
  };
}

/** Plans a client can buy online: everything with a published price. */
export async function getSubscribablePlans(): Promise<Plan[]> {
  return (await getPlans()).filter((plan) => plan.monthlyPrice !== null);
}

export { getBillingTerms };
