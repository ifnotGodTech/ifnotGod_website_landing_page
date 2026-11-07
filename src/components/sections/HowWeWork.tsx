import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

const STEPS = [
  {
    num: "01",
    title: "Understand",
    description: "We listen to your organisation and understand the problem before recommending technology.",
  },
  {
    num: "02",
    title: "Analyse",
    description: "We examine your current processes and identify opportunities for improvement and automation.",
  },
  {
    num: "03",
    title: "Build",
    description: "We design and develop the technology solution that fits your needs.",
  },
  {
    num: "04",
    title: "Improve",
    description: "We measure, refine, and help your organisation get more value from the solution.",
  },
];

export function HowWeWork() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 lg:py-32">
      <RevealOnScroll>
        <SectionHeading eyebrow="How We Work" title="From Problem to Solution." />
      </RevealOnScroll>

      <RevealOnScroll>
        <div className="relative mt-13 grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
          <div aria-hidden className="absolute top-8.5 right-0 left-0 hidden h-px bg-line-strong lg:block" />
          {STEPS.map((step) => (
            <div key={step.num} className="relative pr-7">
              <span className="relative z-10 inline-block bg-ink pr-3.5 font-mono text-[0.85rem] text-orange">
                {step.num}
              </span>
              <h3 className="mt-5.5 text-[1.15rem] font-bold">{step.title}</h3>
              <p className="mt-2.5 text-[0.92rem] text-paper-dim">{step.description}</p>
            </div>
          ))}
        </div>
      </RevealOnScroll>

      <RevealOnScroll>
        <p className="mt-16 text-balance border-t border-line pt-10 font-display text-[clamp(1.4rem,2.6vw,2rem)] font-semibold tracking-[-0.02em]">
          You don&apos;t need to know what technology you need.{" "}
          <span className="text-orange">You just need to know what problem you want solved.</span>
        </p>
      </RevealOnScroll>

      <div className="mt-11">
        <Button href="#contact" variant="outline-orange">
          Let&apos;s Solve Your Problem
        </Button>
      </div>
    </section>
  );
}
