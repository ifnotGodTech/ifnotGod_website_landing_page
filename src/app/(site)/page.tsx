import { About } from "@/components/sections/About";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { LegacyContactRedirect } from "@/components/sections/LegacyContactRedirect";
import { PastWork } from "@/components/sections/PastWork";
import { PlanSummary } from "@/components/sections/PlanSummary";
import { YourWeek } from "@/components/sections/YourWeek";
import { Container } from "@/components/ui/Container";
import { SITE_URL } from "@/shared/constants";
import { buildPageMetadata } from "@/shared/metadata";
import { buildOrganizationJsonLd } from "@/shared/structuredData";

export const metadata = buildPageMetadata({
  title: "AI Automation for Businesses in Nigeria | IFNOTGOD TECH LTD",
  description:
    "IFNOTGOD TECH LTD builds and runs AI automations for businesses and creators in Nigeria. Follow up leads, answer customers and cut repetitive work, for one monthly fee.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <LegacyContactRedirect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildOrganizationJsonLd(SITE_URL) }} />
      <Container>
        <Hero />
      </Container>
      <HowItWorks />
      <YourWeek />
      <PlanSummary />
      <About />
      <PastWork />
      <ClosingCta title="What's the task wasting your time?" detail="Twenty minutes, no cost, and no technical knowledge needed." />
    </>
  );
}
