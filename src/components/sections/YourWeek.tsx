import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const PROBLEMS = [
  { quote: "We forget to call people back.", fix: "Lead follow-up reaches every enquiry on time." },
  { quote: "Customers ask at night and buy elsewhere.", fix: "A WhatsApp sales agent answers at any hour." },
  { quote: "People book, then don't show up.", fix: "Booking and reminders keep your calendar full." },
  { quote: "I'm always chasing money.", fix: "Payment reminders and receipts go out for you." },
  { quote: "I can't post everywhere.", fix: "We turn one video into many posts." },
  { quote: "People comment and I lose the sale.", fix: "Comment-to-DM funnels reply to every comment." },
];

export function YourWeek() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h2 className="max-w-[16em] text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.1] tracking-[-0.025em]">
              Which of these sounds like your week?
            </h2>
            <Link href="/services" className="font-semibold text-orange underline transition-colors hover:text-paper">
              See all services
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-1 border-t border-line-strong md:grid-cols-2 lg:grid-cols-3">
            {PROBLEMS.map((problem) => (
              <li key={problem.quote} className="flex flex-col gap-2 border-b border-line-strong py-6 md:pr-7">
                <p className="font-display text-[1.35rem] font-bold leading-[1.25]">&ldquo;{problem.quote}&rdquo;</p>
                <p className="text-paper-dim">{problem.fix}</p>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-[1.1rem] text-paper-dim">
            Don&apos;t see your problem? Tell us in the audit. If it can be automated, we&apos;ll build it.
          </p>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
