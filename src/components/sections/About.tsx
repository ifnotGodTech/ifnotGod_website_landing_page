import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function About() {
  return (
    <section id="about" className="border-b border-line pb-6 pt-16 sm:pt-24">
      <Container>
        <RevealOnScroll className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <h2 className="text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.1] tracking-[-0.025em]">
            Technology with a purpose.
          </h2>
          <div className="flex flex-col gap-4 text-[1.1rem] text-paper-dim">
            <p className="font-display text-[1.3rem] font-bold leading-[1.35] text-paper">
              IFNOTGOD TECH LTD was created around a simple belief: technology should solve real problems.
            </p>
            <p>
              We don&apos;t believe technology is valuable simply because it is new. It is valuable when it makes work
              easier, businesses more efficient, organisations more effective, and people more productive.
            </p>
            <p>
              Our job is to understand the problem, find the opportunity, and build the technology that makes the
              difference.
            </p>
            <p>We&apos;re based in Lagos, and we work with businesses, creators and organisations across Nigeria.</p>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
