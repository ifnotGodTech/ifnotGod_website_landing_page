import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";

const SOLUTIONS = [
  {
    title: "AI & Business Automation",
    description: "Automate repetitive work, reduce human error, and use AI to make your operations faster and smarter.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Custom Software",
    description: "Purpose-built applications designed around the way your organisation actually works.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 6 3 12l5 6M16 6l5 6-5 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Business Process Automation",
    description: "Turn repetitive manual workflows into streamlined digital processes.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6h9l3 3v9H4z" />
        <path d="M13 6v3h3" />
        <path d="M8 13h5M8 16h5" />
      </svg>
    ),
  },
  {
    title: "Web & Mobile Applications",
    description: "Build reliable digital products for your customers, employees, or organisation.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="12" rx="1" />
        <rect x="8" y="18" width="8" height="3" rx="0.5" />
      </svg>
    ),
  },
  {
    title: "Systems Integration",
    description: "Connect the tools and platforms your organisation already uses so they work together.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="12" cy="18" r="3" />
        <path d="M8.5 7.5 10 16M15.5 7.5 14 16" />
      </svg>
    ),
  },
  {
    title: "Digital Transformation",
    description: "Move inefficient manual processes into smarter, measurable digital workflows.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 18l6-7 4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 7h5v5" />
      </svg>
    ),
  },
];

export function Solutions() {
  return (
    <section id="solutions" className="py-16 sm:py-24 lg:py-32">
      <RevealOnScroll>
        <SectionHeading eyebrow="What We Build" title="Technology Built Around Your Problem.">
          <p className="max-w-[56ch] text-[clamp(1.05rem,1.4vw,1.2rem)] text-paper-dim">
            We don&apos;t force your organisation into a pre-built solution. We understand your challenge first,
            then determine the right technology to solve it.
          </p>
        </SectionHeading>
      </RevealOnScroll>

      <RevealOnScroll>
        <div className="mt-13 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s) => (
            <Card key={s.title} icon={s.icon} title={s.title} description={s.description} size="lg" />
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}
