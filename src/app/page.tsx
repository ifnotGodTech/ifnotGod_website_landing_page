import { Navigation } from "@/components/sections/Navigation";
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
import { Footer } from "@/components/sections/Footer";
import { FloatingCta } from "@/components/ui/FloatingCta";
import { SITE_URL } from "@/shared/constants";
import { buildOrganizationJsonLd } from "@/shared/structuredData";

const CONTAINER ="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-16";

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildOrganizationJsonLd(SITE_URL) }} />
      <Navigation />
      <main>
        <div className={CONTAINER}>
          <Hero />
          <Problem />
          <Solutions />
        </div>
        <AISection />
        <div className={CONTAINER}>
          <HowWeWork />
          <WhyUs />
        </div>
        <WhoWeHelp />
        <div className={CONTAINER}>
          <About />
          <ConversionCta />
          <Contact />
        </div>
      </main>
      <Footer />
      <FloatingCta />
    </>
  );
}
