import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { AUDIT_PATH } from "@/shared/constants";

export function PastWork() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <RevealOnScroll className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-14">
          <h2 className="text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold leading-[1.12] tracking-[-0.025em]">
            We build bigger things too.
          </h2>
          <div className="flex flex-col items-start gap-4">
            <p className="max-w-[32em] text-paper-dim">
              Apps, dashboards and larger platforms are quoted after the audit. Past builds include TravelMate Global,
              a flight, stay and transfer booking platform, and iTestified, a testimony archive app and dashboard.
            </p>
            <Link
              href={`${AUDIT_PATH}?plan=custom`}
              className="font-bold text-orange underline transition-colors hover:text-paper"
            >
              Talk to us about a larger build
            </Link>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
