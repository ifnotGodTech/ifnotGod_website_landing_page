import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getPlanChoices, getPlans } from "@/lib/catalogue";
import { formatPlanPrice } from "@/lib/catalogue/rules";
import { AUDIT_PATH } from "@/shared/constants";
import { ACCOUNTS_ENABLED } from "@/shared/features";
import type { Plan, PlanChoice, PlanId } from "@/types/catalogue";
import { PlanSelector } from "./PlanSelector";

const SHOW_ALL_PANELS = "[data-plan-panel]{display:block!important}";

export async function PricingPlans({ selectedPlanId }: { selectedPlanId?: PlanId } = {}) {
  const plans = await getPlans();
  const options = await Promise.all(
    plans.map(async (plan) => ({
      id: plan.id,
      name: plan.name,
      price: formatPlanPrice(plan),
      tag: plan.tag,
      panel: <PlanPanel plan={plan} choices={await getPlanChoices(plan.id)} />,
    }))
  );
  const initialPlan =
    plans.find((plan) => plan.id === selectedPlanId) ?? plans.find((plan) => plan.recommended) ?? plans[0];

  return (
    <section aria-label="Plans" className="surface-light">
      <noscript>
        <style>{SHOW_ALL_PANELS}</style>
      </noscript>
      <Container className="pb-14 pt-12 sm:pb-18">
        <PlanSelector options={options} initialPlanId={initialPlan.id} />
      </Container>
    </section>
  );
}

function PlanPanel({ plan, choices }: { plan: Plan; choices: PlanChoice[] }) {
  const extras = [
    { label: "Website we build", value: plan.website },
    { label: "Changes", value: plan.changes },
    { label: "Support", value: plan.support },
    { label: "Running it", value: "Hosting and monitoring for your automations, and a monthly report" },
  ];

  return (
    <div className="flex flex-col gap-8 rounded-xl border border-line-light bg-white p-[clamp(24px,4vw,44px)]">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="flex max-w-[40em] flex-col gap-1">
          <h2 className="text-[clamp(1.6rem,3vw,2.1rem)] font-extrabold tracking-[-0.02em]">
            What&apos;s in {plan.name}
          </h2>
          <p className="text-on-light-dim">{plan.summary}</p>
        </div>
        {ACCOUNTS_ENABLED && plan.monthlyPrice !== null ? (
          <div className="flex flex-wrap gap-3">
            <Button href={`/account/subscribe?plan=${plan.id}`}>Subscribe to {plan.name}</Button>
            <Button href={`${AUDIT_PATH}?plan=${plan.id}`} variant="outline-maroon" aria-label={`${plan.ctaLabel}: ${plan.name}`}>
              {plan.ctaLabel}
            </Button>
          </div>
        ) : (
          <Button href={`${AUDIT_PATH}?plan=${plan.id}`} aria-label={`${plan.ctaLabel}: ${plan.name}`}>
            {plan.ctaLabel}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
        {choices.map((choice) => (
          <div key={choice.group.id} className="flex flex-col gap-3">
            <h3 className="text-[1.25rem] font-extrabold leading-[1.25]">{choice.label}</h3>
            <p className="text-[0.94rem] text-on-light-dim">
              {choice.allowance === "agreed" ? "As many as you need, including:" : "Choose from:"}
            </p>
            <ul className="flex list-disc flex-col gap-1.5 pl-5">
              {choice.services.map((service) => (
                <li key={service.id}>
                  {service.name}
                  {service.note && <span className="text-on-light-dim"> ({service.note})</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-line-light pt-6">
        <h3 className="text-[1.25rem] font-extrabold">Also included</h3>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {extras.map((extra) => (
            <div key={extra.label}>
              <dt className="font-semibold">{extra.label}</dt>
              <dd className="text-on-light-dim">{extra.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
