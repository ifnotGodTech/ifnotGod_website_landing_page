"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";

const FLOW_STEPS = ["Business Challenge", "Analysis", "Technology", "Solution", "Better Business"];

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const rise = (delay: number) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: "easeOut" as const },
        };

  return (
    <section
      id="top"
      className="relative grid grid-cols-1 items-center gap-10 pb-18 pt-[clamp(140px,18vw,190px)] sm:pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-18"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[2%] -top-[14%] -z-10 h-130 w-130 rounded-full blur-[10px]"
        style={{ background: "radial-gradient(circle, rgba(224,123,42,0.22), transparent 68%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[8%] top-[20%] -z-10 h-95 w-95 rounded-full blur-[20px]"
        style={{ background: "radial-gradient(circle, rgba(107,31,42,0.38), transparent 70%)" }}
      />

      <div>
        <motion.span
          {...rise(0.05)}
          className="flex items-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-orange before:content-[''] before:h-px before:w-[18px] before:bg-orange"
        >
          Nigerian Technology Consultancy
        </motion.span>

        <motion.h1 {...rise(0.16)} className="mt-5 text-[clamp(2.6rem,5.4vw,4.7rem)] font-semibold">
          Every Problem Has <em className="text-orange italic">a Tech Solution.</em>
        </motion.h1>

        <motion.div {...rise(0.27)} className="mt-5.5 flex max-w-[56ch] flex-col gap-3.5">
          <p className="text-[clamp(1.05rem,1.4vw,1.2rem)] text-paper-dim">
            Your business doesn&apos;t always need more people, more paperwork, or more complexity. Sometimes it
            needs the right technology.
          </p>
          <p className="text-[clamp(1.05rem,1.4vw,1.2rem)] text-paper-dim">
            At IFNOTGOD TECH LTD, we identify business challenges, automate inefficient processes, and build
            practical technology and AI solutions that help organisations work smarter.
          </p>
        </motion.div>

        <motion.div {...rise(0.38)} className="mt-8.5 flex flex-wrap gap-4">
          <Button href="#contact">Tell Us Your Challenge</Button>
          <Button href="#solutions" variant="ghost">
            See What We Solve
          </Button>
        </motion.div>
      </div>

      <div aria-label="From business challenge to better business" className="relative border-l border-line-strong pl-6.5">
        <div
          aria-hidden
          className="absolute -left-px top-1.5 bottom-1.5 w-px"
          style={{ background: "linear-gradient(180deg, var(--color-maroon), var(--color-orange))" }}
        />
        {FLOW_STEPS.map((step, i) => (
          <motion.div
            key={step}
            initial={shouldReduceMotion ? undefined : { opacity: 0 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.12, ease: "easeOut" }}
            className="relative py-4"
          >
            <span
              aria-hidden
              className="absolute -left-[30px] top-5.5 h-2 w-2 rotate-45 border-[1.5px] border-orange bg-ink"
            />
            <div className={`font-display text-[1.25rem] ${i === 3 ? "text-orange" : ""}`}>{step}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
