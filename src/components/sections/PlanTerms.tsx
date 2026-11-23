import { Container } from "@/components/ui/Container";
import { planTerms } from "@/lib/accounts/billing";
import { cn } from "@/shared/cn";
import type { BillingTerms } from "@/types/catalogue";

const QUESTIONS = [
  {
    question: "Do I need to understand the technology?",
    answer: "No. Tell us the problem. We choose the tools, build everything and keep your automations running.",
  },
  {
    question: "What if my problem isn't on your list?",
    answer: "Bring it to the audit. We'll tell you whether it fits a plan or needs a custom quote.",
  },
  {
    question: "Can I cancel?",
    answer:
      "Yes. There's no minimum term. Your plan renews automatically until you cancel, and we remind you before each renewal. If you cancel, everything in your plan, including your automations and website, keeps working until the end of the period you've paid for, and it won't renew after that. Then your automations stop, because they run on our systems. Your website is yours to keep.",
  },
];

/** The setup fee and upfront offers come from the terms the team sets in the dashboard. */
export function PlanTerms({ terms }: { terms: BillingTerms }) {
  return (
    <section className="surface-light">
      <Container className="grid grid-cols-1 gap-12 pb-18 sm:pb-24 lg:grid-cols-2">
        <div className="flex flex-col gap-3.5">
          <h2 className="text-[1.75rem] font-extrabold tracking-[-0.02em]">Plan terms</h2>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-on-light-dim">
            {planTerms(terms).map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2.5">
          <h2 className="text-[1.75rem] font-extrabold tracking-[-0.02em]">Common questions</h2>
          <div>
            {QUESTIONS.map((item, index) => (
              <details
                key={item.question}
                className={cn("border-t border-line-light py-3", index === QUESTIONS.length - 1 && "border-b")}
              >
                <summary className="cursor-pointer font-semibold">{item.question}</summary>
                <p className="pt-2 text-on-light-dim">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
