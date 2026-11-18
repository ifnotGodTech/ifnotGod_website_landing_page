import { About } from "@/components/sections/About";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { LegacyContactRedirect } from "@/components/sections/LegacyContactRedirect";
import { PastWork } from "@/components/sections/PastWork";
import { PlanSummary } from "@/components/sections/PlanSummary";
import { YourWeek } from "@/components/sections/YourWeek";
import { Container } from "@/components/ui/Container";
import { getSiteText } from "@/lib/catalogue";
import { SITE_URL } from "@/shared/constants";
import { buildPageMetadata } from "@/shared/metadata";
import { buildOrganizationJsonLd } from "@/shared/structuredData";

export const metadata = buildPageMetadata({
  title: "AI Automation for Businesses in Nigeria | IFNOTGOD TECH LTD",
  description:
    "IFNOTGOD TECH LTD builds and runs AI automations for businesses and creators in Nigeria. Follow up leads, answer customers and cut repetitive work, for one monthly fee.",
  path: "/",
});

export default async function Home() {
  const text = await getSiteText();

  return (
    <>
      <LegacyContactRedirect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildOrganizationJsonLd(SITE_URL) }} />
      <Container>
        <Hero headline={text.headline} introduction={text.introduction} />
      </Container>
      <HowItWorks />
      <YourWeek />
      <PlanSummary />
      <About />
      <PastWork />
      <ClosingCta title={text.closingCallToAction} detail="Twenty minutes, no cost, and no technical knowledge needed." />
    </>
  );
}
