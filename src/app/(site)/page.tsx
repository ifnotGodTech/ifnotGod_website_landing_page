import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Solutions } from "@/components/sections/Solutions";
import { AISection } from "@/components/sections/AISection";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { WhyUs } from "@/components/sections/WhyUs";
import { WhoWeHelp } from "@/components/sections/WhoWeHelp";
import { About } from "@/components/sections/About";
import { ConversionCta } from "@/components/sections/ConversionCta";
import { Contact } from "@/components/sections/Contact";
import { Container } from "@/components/ui/Container";
import { SITE_URL } from "@/shared/constants";
import { buildOrganizationJsonLd } from "@/shared/structuredData";

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildOrganizationJsonLd(SITE_URL) }} />
      <Container>
        <Hero />
        <Problem />
        <Solutions />
      </Container>
      <AISection />
      <Container>
        <HowWeWork />
        <WhyUs />
      </Container>
      <WhoWeHelp />
      <Container>
        <About />
        <ConversionCta />
        <Contact />
      </Container>
    </>
  );
}
