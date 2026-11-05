import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Button } from "@/components/ui/Button";

export function About() {
  return (
    <section id="about" className="py-16 sm:py-24 lg:py-32">
      <RevealOnScroll>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.5fr_1fr] lg:gap-16">
          <div>
            <span className="flex items-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-orange before:content-[''] before:h-px before:w-[18px] before:bg-orange">
              About
            </span>
            <h2 className="mt-4 text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold">Technology With a Purpose.</h2>
          </div>
          <div className="flex max-w-[62ch] flex-col gap-5.5 text-[1.02rem] text-paper-dim">
            <p>
              <strong className="font-semibold text-paper">IFNOTGOD TECH LTD</strong> was created around a simple
              belief: technology should solve real problems.
            </p>
            <p>
              We don&apos;t believe technology is valuable simply because it is new. It is valuable when it makes
              work easier, businesses more efficient, organisations more effective, and people more productive.
            </p>
            <p>Our job is to understand the problem, find the opportunity, and build the technology that makes the difference.</p>
            <div className="mt-2">
              <Button href="#contact" variant="outline-orange">
                Tell Us Your Challenge
              </Button>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
