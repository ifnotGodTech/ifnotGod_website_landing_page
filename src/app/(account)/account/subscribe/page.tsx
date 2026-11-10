import { redirect } from "next/navigation";
import { AccountBand } from "@/components/account/AccountBand";
import { ActionForm } from "@/components/account/ActionForm";
import { SubscribeForm } from "@/components/account/SubscribeForm";
import { Container } from "@/components/ui/Container";
import { requireSession } from "@/lib/accounts";
import { getBillingTerms, getSubscribablePlans, loadAccount } from "@/lib/accounts/account";
import { BILLING_PERIODS, buildQuote, isBillingPeriod, type Quote } from "@/lib/accounts/billing";
import { changePlanAction, startSubscriptionAction } from "@/lib/accounts/subscriptionActions";
import { formatNaira, formatPlanPrice } from "@/lib/catalogue/rules";
import { formatLongDate } from "@/shared/dates";
import { buildPageMetadata } from "@/shared/metadata";
import { parsePlanParam } from "@/shared/validators/contact";

export const metadata = buildPageMetadata({
  title: "Choose your plan | IFNOTGOD TECH LTD",
  description: "Choose an IFNOTGOD TECH plan and how you'd like to pay.",
  path: "/account/subscribe",
  index: false,
});

export default async function SubscribePage({ searchParams }: PageProps<"/account/subscribe">) {
  const { plan: planParam, period: periodParam } = await searchParams;
  const requested = parsePlanParam(planParam);
  const { token } = await requireSession(requested ? `/account/subscribe?plan=${requested}` : "/account/subscribe");
  const [overview, plans, terms] = await Promise.all([loadAccount(token), getSubscribablePlans(), getBillingTerms()]);
  const { subscription } = overview;

  // A cancelled plan is still running, so it's kept from the account page, not bought again.
  if (subscription?.status === "cancelled") redirect("/account");

  const fallback = plans.find((plan) => plan.recommended) ?? plans[0];
  const initialPlan = plans.find((plan) => plan.id === requested)?.id ?? fallback.id;

  if (subscription) {
    return (
      <>
        <AccountBand
          back
          title="Change your plan"
          intro={`Your new plan starts when your current one renews on ${formatLongDate(subscription.currentPeriodEnd)}. There's nothing to pay today.`}
        />
        <Container className="pb-22 pt-10">
          <ActionForm action={changePlanAction} label="Change your plan" submitLabel="Save plan change" pendingLabel="Saving…">
            <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <legend className="sr-only">Plan</legend>
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className="flex cursor-pointer items-start gap-3 rounded-[10px] border-2 border-line-light bg-white p-4.5 has-[:checked]:border-maroon"
                >
                  <input type="radio" name="plan" value={plan.id} defaultChecked={plan.id === (subscription.pendingPlanId ?? subscription.planId)} className="mt-1.5 accent-maroon" />
                  <span className="flex flex-col">
                    <span className="font-display text-[1.25rem] font-extrabold">
                      {plan.name}
                      {plan.id === subscription.planId && <span className="font-body text-[0.88rem] font-semibold"> (current)</span>}
                    </span>
                    <span className="font-semibold">{formatPlanPrice(plan)}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </ActionForm>
        </Container>
      </>
    );
  }

  const quotes: Record<string, Quote> = {};
  const totals: Record<string, string> = {};
  for (const plan of plans) {
    for (const period of BILLING_PERIODS) {
      const quote = buildQuote(plan, period.id, terms, { setupFeePaid: overview.setupFeePaid });
      quotes[`${plan.id}:${period.id}`] = quote;
      totals[`${plan.id}:${period.id}`] = formatNaira(quote.dueToday);
    }
  }

  return (
    <>
      <AccountBand back title="Choose your plan" intro="Pick a plan and how you'd like to pay. You can change or cancel your plan from your account." />
      <Container className="pb-22 pt-10">
        <SubscribeForm
          action={startSubscriptionAction}
          plans={plans.map((plan) => ({ id: plan.id, name: plan.name, detail: formatPlanPrice(plan) }))}
          periods={BILLING_PERIODS.map((period) => ({ id: period.id, name: period.label, detail: "" }))}
          quotes={quotes}
          totals={totals}
          initialPlan={initialPlan}
          initialPeriod={isBillingPeriod(periodParam) ? periodParam : "monthly"}
        />
      </Container>
    </>
  );
}
