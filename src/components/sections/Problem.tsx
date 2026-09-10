import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const PROBLEMS = [
  {
    title: "Too much manual work",
    description: "Hours spent on tasks a system could do in seconds.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 8h12M4 13h16M4 18h9" />
      </svg>
    ),
  },
  {
    title: "Repetitive tasks",
    description: "The same steps, run by hand, again and again.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 12a7 7 0 0 1 12-5l2-2M19 12a7 7 0 0 1-12 5l-2 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Paper-based processes",
    description: "Records that live in folders instead of systems.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M15 3v3h3" />
      </svg>
    ),
  },
  {
    title: "Disconnected systems",
    description: "Tools that don't talk to each other.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="12" r="3" />
        <path d="M9 12h1.5M13.5 12H15" strokeDasharray="1 3" />
      </svg>
    ),
  },
  {
    title: "Slow customer response",
    description: "Customers waiting longer than they should.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Data management problems",
    description: "Information scattered across spreadsheets.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 6h14M5 12h14M5 18h14" />
        <circle cx="9" cy="6" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="9" cy="18" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Difficult reporting",
    description: "No clear view of what's actually happening.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19V9M10 19V5M16 19v-7M4 19h16" />
      </svg>
    ),
  },
  {
    title: "Inefficient workflows",
    description: "Approvals and handoffs that take too long.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6h11M4 12h7M4 18h13" strokeLinecap="round" />
        <path d="M17 15l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function Problem() {
  return (
    <section className="py-16 sm:py-24 lg:py-32">
      <RevealOnScroll>
        <SectionHeading eyebrow="The Problem" title="Your Problem Doesn't Have to Be a Technology Problem.">
          <p className="max-w-[56ch] text-[clamp(1.05rem,1.4vw,1.2rem)] text-paper-dim">
            Manual processes. Repetitive tasks. Disconnected systems. Slow approvals. Data scattered across
            spreadsheets. Communication gaps. Difficulty keeping up with customers. These aren&apos;t just
            operational problems — they&apos;re opportunities to use technology better.
          </p>
          <p className="max-w-[56ch] text-[clamp(1.05rem,1.4vw,1.2rem)] font-semibold text-paper">
            Tell us what&apos;s slowing your organisation down. We&apos;ll help you find a smarter way.
          </p>
        </SectionHeading>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <div className="mt-13 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map((p) => (
            <Card key={p.title} icon={p.icon} title={p.title} description={p.description} />
          ))}
        </div>
      </RevealOnScroll>

      <div className="mt-11">
        <Button href="#contact" variant="outline-orange">
          Let&apos;s Solve It
        </Button>
      </div>
    </section>
  );
}
