import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";

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
      style={{ background: "linear-gradient(120deg, rgba(107,31,42,0.22), var(--color-surface) 60%)" }}
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
          <div className="mt-2 flex flex-wrap gap-3">
            {AUDIENCES.map((audience) => (
              <span
                key={audience}
                className="rounded-full border border-line-strong px-5 py-2.5 font-mono text-[0.82rem] tracking-[0.03em] text-paper-dim transition-colors hover:border-orange hover:text-orange"
              >
                {audience}
              </span>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
