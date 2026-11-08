import { buildPageMetadata } from "@/shared/metadata";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { PlanTerms } from "@/components/sections/PlanTerms";
import { PricingPlans } from "@/components/sections/PricingPlans";
import { Container } from "@/components/ui/Container";
import { getPlans } from "@/lib/catalogue";
import { SITE_URL } from "@/shared/constants";
import { buildPlanOffersJsonLd } from "@/shared/structuredData";
import { parsePlanParam } from "@/shared/validators/contact";

export const metadata = buildPageMetadata({
  title: "Automation Plans and Prices | IFNOTGOD TECH LTD",
  description:
    "See exactly what each IFNOTGOD TECH plan includes. One monthly fee covers your automations, monitoring and fixes, from ₦20,000 a month.",
  path: "/pricing",
});

// Reads ?plan= on the server, so a link such as "See everything in Pro" opens with that plan
// selected, with no flash of another plan and nothing to do without JavaScript.
export default async function PricingPage({ searchParams }: PageProps<"/pricing">) {
  const [plans, { plan }] = await Promise.all([getPlans(), searchParams]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildPlanOffersJsonLd(SITE_URL, plans) }} />
      <Container data-page-hero className="flex flex-col gap-3.5 pb-14 pt-[clamp(120px,14vw,160px)] sm:pb-18">
        <h1 className="hero-rise max-w-[15em] text-[clamp(2.4rem,5vw,3.9rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Plans that do the work for you.
        </h1>
        <p style={{ animationDelay: "0.1s" }} className="hero-rise max-w-[36em] text-[clamp(1.05rem,1.5vw,1.2rem)] text-paper-dim">
          Pick a plan to see exactly what you get. The free audit shows which one suits your business or brand.
        </p>
      </Container>
      <PricingPlans selectedPlanId={parsePlanParam(plan)} />
      <PlanTerms />
      <ClosingCta title="Not sure which plan? The audit will tell you." />
    </>
  );
}
