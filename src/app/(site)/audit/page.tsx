import { buildPageMetadata } from "@/shared/metadata";
import { AuditForm } from "@/components/sections/AuditForm";
import { Container } from "@/components/ui/Container";
import { getPlans } from "@/lib/catalogue";
import { cn } from "@/shared/cn";
import { CONTACT_INFO } from "@/shared/constants";
import { parsePlanParam } from "@/shared/validators/contact";

export const metadata = buildPageMetadata({
  title: "Book a Free Automation Audit | IFNOTGOD TECH LTD",
  description:
    "Tell us what's wasting your time. In a free 20-minute call, we find the three tasks costing you the most time and show how to fix them.",
  path: "/audit",
});

const NEXT_STEPS = [
  "We contact you to arrange the call.",
  "We go through your work and find what to automate.",
  "You get a short written plan and the package that fits.",
];

const linkClass = "w-fit font-semibold text-orange underline transition-colors hover:text-paper";

// Reads ?plan= on the server, so the plan is chosen even without JavaScript.
export default async function AuditPage({ searchParams }: PageProps<"/audit">) {
  const [plans, { plan }] = await Promise.all([getPlans(), searchParams]);

  return (
    <Container className="grid grid-cols-1 items-start gap-14 pb-22 pt-[clamp(120px,14vw,160px)] lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-7">
        <h1 className="text-[clamp(2.4rem,5vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Tell us what&apos;s wasting your time.
        </h1>
        <p className="text-[clamp(1.05rem,1.5vw,1.2rem)] text-paper-dim">
          In 20 minutes, we&apos;ll find the three tasks costing you the most time and show how to fix them. It&apos;s
          free, and you don&apos;t need to know any technology.
        </p>

        <div className="flex flex-col gap-3.5 border-t border-line-strong pt-6">
          <h2 className="text-[1.4rem] font-bold">What happens next</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5.5 text-paper-dim">
            {NEXT_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-2 border-t border-line-strong pt-6">
          <h2 className="text-[1.4rem] font-bold">Prefer to message us?</h2>
          <a href={CONTACT_INFO.whatsappHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
            WhatsApp {CONTACT_INFO.phoneDisplay}
          </a>
          <a href={`mailto:${CONTACT_INFO.email}`} className={cn(linkClass, "break-all")}>
            {CONTACT_INFO.email}
          </a>
          <a href={CONTACT_INFO.phoneHref} className={linkClass}>
            Call {CONTACT_INFO.phoneDisplay}
          </a>
        </div>
      </div>

      <AuditForm plans={plans.map(({ id, name }) => ({ id, name }))} defaultPlan={parsePlanParam(plan)} />
    </Container>
  );
}
