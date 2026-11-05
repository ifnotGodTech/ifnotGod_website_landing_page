import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";

const VALUES = [
  {
    title: "Problem First",
    description: "We focus on the business challenge before choosing the technology.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    ),
  },
  {
    title: "Practical Solutions",
    description: "We build solutions designed to deliver real business value.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "AI-Ready",
    description: "We identify opportunities to use AI where it can make a meaningful difference.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: "Built Around You",
    description: "Your organisation is different. Your technology should be too.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4v16M4 4l16 4-16 4" />
      </svg>
    ),
  },
  {
    title: "Long-Term Thinking",
    description: "We build with scalability, reliability, and future growth in mind.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 18 10 10l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function WhyUs() {
  return (
    <section id="why-us" className="py-16 sm:py-24 lg:py-32">
      <RevealOnScroll>
        <SectionHeading eyebrow="Why IFNOTGOD TECH LTD" title="Technology Should Solve Problems, Not Create Them." />
      </RevealOnScroll>

      <RevealOnScroll>
        <div className="mt-13 grid grid-cols-1 gap-8 sm:grid-cols-1 lg:grid-cols-5">
          {VALUES.map((value, i) => (
            <div
              key={value.title}
              className={
                i < VALUES.length - 1
                  ? "border-b border-line pb-7 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6"
                  : "pb-0"
              }
            >
              <div className="h-6.5 w-6.5 text-orange">{value.icon}</div>
              <h3 className="mt-5 text-[1rem] font-bold">{value.title}</h3>
              <p className="mt-2.5 text-[0.88rem] text-paper-dim">{value.description}</p>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}
