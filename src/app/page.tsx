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

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-16">
        <Hero />
        <Problem />
        <Solutions />
      </main>
      <AISection />
      <main className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-16">
        <HowWeWork />
        <WhyUs />
      </main>
      <WhoWeHelp />
      <main className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-16">
        <About />
        <ConversionCta />
        <Contact />
      </main>
      <Footer />
      <FloatingCta />
    </>
  );
}
