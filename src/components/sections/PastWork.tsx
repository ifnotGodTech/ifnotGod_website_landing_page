import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { AUDIT_PATH } from "@/shared/constants";

export function PastWork() {
  return (
    <section id="about" className="py-16 sm:py-24">
      <Container>
        <RevealOnScroll className="grid grid-cols-1 gap-14 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold leading-[1.12] tracking-[-0.025em]">
              We build bigger things too.
            </h2>
            <p className="max-w-[32em] text-paper-dim">
              Apps, dashboards and larger platforms are quoted after the audit. Past builds include TravelMate Global,
              a flight, stay and transfer booking platform, and iTestified, a testimony archive app and dashboard.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 rounded-[10px] border border-line-strong p-7 sm:p-8">
            <h2 className="text-[1.6rem] font-extrabold tracking-[-0.015em]">Founding client offer</h2>
            <p className="text-paper-dim">
              We&apos;re taking three founding clients: 50% off any plan for the first 3 months and no setup fee, in
              exchange for a short testimonial and permission to share the results.
            </p>
            <Link href={AUDIT_PATH} className="font-bold text-orange underline transition-colors hover:text-paper">
              Ask about a founding place
            </Link>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
