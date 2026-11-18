import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const STEPS = [
  {
    title: "Free automation audit",
    detail: "A 20-minute call. We find the three tasks costing you the most time and show how to fix them.",
  },
  {
    title: "We build and set up",
    detail: "We build your automations, connect them to the tools you already use and test them with you.",
  },
  {
    title: "We run and improve",
    detail: "We host, monitor and fix your automations, and keep improving them every month.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-line bg-surface">
      <Container className="py-16 sm:py-22">
        <RevealOnScroll>
          <h2 className="max-w-[18em] text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.1] tracking-[-0.025em]">
            You tell us the task that wastes your time. We handle the rest.
          </h2>
          <ol className="mt-11 grid grid-cols-1 gap-10 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2.5">
                <span aria-hidden className="font-display text-[2.1rem] font-extrabold leading-none text-orange">
                  {index + 1}
                </span>
                <h3 className="text-[1.35rem] font-bold">{step.title}</h3>
                <p className="text-paper-dim">{step.detail}</p>
              </li>
            ))}
          </ol>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
