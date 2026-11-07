import { buildPageMetadata } from "@/shared/metadata";
import { ServiceGroups } from "@/components/sections/ServiceGroups";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AUDIT_PATH } from "@/shared/constants";

export const metadata = buildPageMetadata({
  title: "Business Automation Services in Nigeria | IFNOTGOD TECH LTD",
  description:
    "AI automations, social and content services, and AI agents for businesses and creators. Start with your problem and we'll match the service.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <Container data-page-hero className="flex flex-col gap-4 pb-8 pt-[clamp(120px,14vw,160px)]">
        <h1 className="hero-rise max-w-[14em] text-[clamp(2.4rem,5vw,3.9rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Start with the problem. We&apos;ll match the service.
        </h1>
        <p style={{ animationDelay: "0.1s" }} className="hero-rise max-w-[38em] text-[clamp(1.05rem,1.5vw,1.2rem)] text-paper-dim">
          For business owners and content creators. If your problem isn&apos;t here, bring it to the free audit.
        </p>
      </Container>

      <ServiceGroups />

      <section className="pb-22 pt-16">
        <Container className="flex flex-col gap-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <h2 className="text-[1.75rem] font-extrabold tracking-[-0.02em]">Included with every plan</h2>
              <p className="text-paper-dim">
                A website built to suit your plan, plus monitoring, fixes and a monthly report for your automations.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <h2 className="text-[1.75rem] font-extrabold tracking-[-0.02em]">Need something larger?</h2>
              <p className="text-paper-dim">
                Apps, dashboards and platforms are quoted after the audit under a Custom plan.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3.5">
            <Button href={AUDIT_PATH}>Book a free automation audit</Button>
            <Button href="/pricing" variant="ghost">
              See plans and prices
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
