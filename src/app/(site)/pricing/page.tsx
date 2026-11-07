import type { Metadata } from "next";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { PlanTerms } from "@/components/sections/PlanTerms";
import { PricingPlans } from "@/components/sections/PricingPlans";
import { Container } from "@/components/ui/Container";

const TITLE = "Plans and Prices | IFNOTGOD TECH LTD";
const DESCRIPTION =
  "See exactly what each IFNOTGOD TECH plan includes. One monthly fee covers your automations, monitoring and fixes, from ₦20,000 a month.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", locale: "en_NG" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function PricingPage() {
  return (
    <>
      <Container data-page-hero className="flex flex-col gap-3.5 pb-14 pt-[clamp(120px,14vw,160px)] sm:pb-18">
        <h1 className="hero-rise max-w-[15em] text-[clamp(2.4rem,5vw,3.9rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Plans that do the work for you.
        </h1>
        <p style={{ animationDelay: "0.1s" }} className="hero-rise max-w-[36em] text-[clamp(1.05rem,1.5vw,1.2rem)] text-paper-dim">
          Pick a plan to see exactly what you get. The free audit shows which one suits your business or brand.
        </p>
      </Container>
      <PricingPlans />
      <PlanTerms />
      <ClosingCta title="Not sure which plan? The audit will tell you." />
    </>
  );
}
