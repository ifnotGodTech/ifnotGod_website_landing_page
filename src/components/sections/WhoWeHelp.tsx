import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

const AUDIENCES = [
  "Startups",
  "Small & Medium Businesses",
  "Enterprises",
  "NGOs",
  "Schools",
  "Professional Organisations",
  "Churches & Religious Organisations",
  "Other Institutions",
];

export function WhoWeHelp() {
  return (
    <section
      className="border-y border-line"
      style={{ background: "linear-gradient(120deg, color-mix(in srgb, var(--color-maroon) 22%, transparent), var(--color-surface) 60%)" }}
    >
      <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8 sm:py-22 lg:px-16">
        <RevealOnScroll>
          <SectionHeading eyebrow="Who We Help" title="Built for Organisations That Want to Work Smarter." className="mb-8.5">
            <p className="max-w-[56ch] text-[clamp(1.05rem,1.4vw,1.2rem)] text-paper-dim">
              Whether you&apos;re running a growing business or managing a large organisation, if there&apos;s a
              process that could work better, there&apos;s probably a technology solution worth exploring.
            </p>
          </SectionHeading>
        </RevealOnScroll>

        <RevealOnScroll>
          <ul className="mt-2 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((audience) => (
              <li key={audience} className="flex min-h-24 items-end bg-ink p-5 font-display text-[1rem] font-semibold">
                {audience}
              </li>
            ))}
          </ul>
        </RevealOnScroll>

        <div className="mt-11">
          <Button href="#contact" variant="outline-orange">
            Let&apos;s Solve Your Problem
          </Button>
        </div>
      </div>
    </section>
  );
}
