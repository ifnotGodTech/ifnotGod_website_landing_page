import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Button } from "@/components/ui/Button";
import { CONTACT_INFO } from "@/shared/constants";

export function ConversionCta() {
  return (
    <section className="py-16 sm:py-24 lg:py-32">
      <RevealOnScroll>
        <div
          className="relative overflow-hidden rounded-sm border border-line py-20 text-center sm:py-28 lg:py-35"
          style={{
            background:
              "radial-gradient(circle at 30% 15%, rgba(224,123,42,0.24), transparent 50%), radial-gradient(circle at 75% 85%, rgba(107,31,42,0.55), transparent 55%), linear-gradient(180deg, var(--color-surface-2), var(--color-ink))",
          }}
        >
          <span className="flex items-center justify-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-orange">
            Let&apos;s Solve Something
          </span>
          <h2 className="mx-auto mt-4.5 max-w-[20ch] text-[clamp(2.2rem,5vw,3.6rem)] font-semibold">
            What&apos;s the Problem You&apos;re Trying to Solve?
          </h2>
          <p className="mx-auto mt-5 max-w-[56ch] text-[clamp(1.05rem,1.4vw,1.2rem)] text-paper-dim">
            Don&apos;t worry if you don&apos;t know which software, automation, or AI solution you need. That&apos;s
            our job.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="#contact">Tell Us Your Challenge</Button>
            <Button href={CONTACT_INFO.whatsappHref} target="_blank" rel="noopener noreferrer" variant="ghost">
              Talk to Our Team
            </Button>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
