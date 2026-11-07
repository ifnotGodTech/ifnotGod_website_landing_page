import { Button } from "@/components/ui/Button";
import { AUDIT_PATH } from "@/shared/constants";

const EXAMPLE_RUN = [
  {
    time: "9:42 pm",
    title: "A customer asks about your prices",
    detail: "The message comes in on WhatsApp after you have closed.",
  },
  {
    time: "9:42 pm",
    title: "They get a helpful reply straight away",
    detail: "Answered from your own information, with a way to reach a person.",
  },
  {
    time: "9:43 pm",
    title: "Their details are saved",
    detail: "Name, number and what they asked go into your records.",
  },
  {
    time: "8:00 am",
    title: "Your team is ready to close the sale",
    detail: "The right person gets the lead on their phone before the day starts.",
  },
];

export function Hero() {
  return (
    <section
      data-page-hero
      className="grid grid-cols-1 items-center gap-12 pb-18 pt-[clamp(120px,14vw,170px)] sm:pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
    >
      <div className="flex flex-col items-start gap-6.5">
        <h1 className="hero-rise text-[clamp(2.6rem,5.4vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
          Your business, answering back while you sleep.
        </h1>
        <p style={{ animationDelay: "0.1s" }} className="hero-rise max-w-[34em] text-[clamp(1.05rem,1.5vw,1.25rem)] text-paper-dim">
          We build and run AI automations that follow up leads, answer customers and handle repetitive work. You
          pay one monthly fee, and you don&apos;t need to touch any technology.
        </p>
        <div style={{ animationDelay: "0.2s" }} className="hero-rise flex flex-wrap gap-3.5">
          <Button href={AUDIT_PATH}>Book a free automation audit</Button>
          <Button href="/pricing" variant="ghost">
            See plans and prices
          </Button>
        </div>
        <p style={{ animationDelay: "0.3s" }} className="hero-rise text-[0.94rem] text-paper-dim">
          Every problem has a tech solution. Tell us yours.
        </p>
      </div>

      <figure
        style={{ animationDelay: "0.25s" }}
        className="hero-rise rounded-[14px] border border-line-strong bg-surface p-5 sm:p-7"
      >
        <figcaption className="pb-3.5 text-[0.88rem] text-paper-dim">
          Example: a customer messages your business at night
        </figcaption>
        <ol>
          {EXAMPLE_RUN.map((step) => (
            <li key={step.title} className="grid grid-cols-[66px_minmax(0,1fr)] gap-3 border-t border-line py-3.5 sm:grid-cols-[76px_minmax(0,1fr)] sm:gap-4">
              <span className="font-display text-[0.94rem] font-bold tabular-nums text-orange">{step.time}</span>
              <div className="flex flex-col gap-0.5">
                <strong className="font-display font-bold">{step.title}</strong>
                <span className="text-[0.94rem] text-paper-dim">{step.detail}</span>
              </div>
            </li>
          ))}
        </ol>
      </figure>
    </section>
  );
}
