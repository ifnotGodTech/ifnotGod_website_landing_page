import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getPlanChoices, getPlans } from "@/lib/catalogue";
import { formatNaira, planHighlights } from "@/lib/catalogue/rules";
import { cn } from "@/shared/cn";
import { AUDIT_PATH } from "@/shared/constants";
import type { Plan } from "@/types/catalogue";

export async function PlanSummary() {
  const plans = await getPlans();
  const cards = await Promise.all(
    plans.map(async (plan) => ({ plan, highlights: planHighlights(plan, await getPlanChoices(plan.id)) }))
  );

  return (
    <section className="surface-light">
      <Container className="py-16 sm:py-24">
        <div className="flex max-w-[42em] flex-col gap-3">
          <h2 className="text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.1] tracking-[-0.025em]">
            One monthly fee. We do the work.
          </h2>
          <p className="text-[1.1rem] text-on-light-dim">
            Every plan includes hosting, monitoring, fixes and a monthly report. Third-party costs, such as WhatsApp
            messages and AI usage, are billed at cost.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ plan, highlights }) => (
            <PlanCard key={plan.id} plan={plan} highlights={highlights} />
          ))}
        </ul>

        <Link href="/pricing" className="mt-10 inline-block font-bold text-maroon underline hover:text-maroon-bright">
          See exactly what&apos;s in each plan
        </Link>
      </Container>
    </section>
  );
}

function PlanCard({ plan, highlights }: { plan: Plan; highlights: string[] }) {
  const quoted = plan.monthlyPrice === null;

  return (
    <li
      className={cn(
        "flex flex-col gap-3.5 rounded-[10px] p-6.5",
        plan.recommended && "surface-maroon",
        quoted && "surface-ink",
        !plan.recommended && !quoted && "border border-line-light bg-white"
      )}
    >
      <div className="flex items-center justify-between gap-2.5">
        <h3 className="text-[1.4rem] font-extrabold">{plan.name}</h3>
        {plan.recommended && (
          <span className="rounded-full bg-paper px-2.5 py-0.5 text-[0.8rem] font-semibold text-maroon">
            Recommended
          </span>
        )}
      </div>
      <p data-testid="plan-price" className="whitespace-nowrap font-display text-[1.7rem] font-extrabold tracking-[-0.02em]">
        {plan.monthlyPrice === null ? (
          "Let's talk"
        ) : (
          <>
            {formatNaira(plan.monthlyPrice)}
            <span className="text-[0.94rem] font-semibold tracking-normal"> / month</span>
          </>
        )}
      </p>
      <ul className="flex grow list-disc flex-col gap-1.5 pl-4.5">
        {highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <Button
        href={`${AUDIT_PATH}?plan=${plan.id}`}
        variant={plan.recommended ? "paper" : quoted ? "ghost" : "outline-maroon"}
        aria-label={`${plan.ctaLabel}: ${plan.name}`}
      >
        {plan.ctaLabel}
      </Button>
    </li>
  );
}
