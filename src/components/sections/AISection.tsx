import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Button } from "@/components/ui/Button";

const AI_EXAMPLES = [
  "AI customer support",
  "Document processing",
  "Automated reporting",
  "Intelligent data extraction",
  "Workflow automation",
  "Internal AI assistants",
  "Lead qualification",
  "Content automation",
  "Business intelligence",
  "AI-powered operational tools",
];

const NODE_POSITIONS = [
  [60, 80],
  [280, 70],
  [300, 190],
  [250, 290],
  [90, 280],
  [50, 180],
] as const;

export function AISection() {
  return (
    <section
      className="border-y border-line"
      style={{
        background:
          "radial-gradient(circle at 85% 20%, rgba(224,123,42,0.12), transparent 45%), linear-gradient(180deg, rgba(107,31,42,0.16), var(--color-ink) 75%)",
      }}
    >
      <RevealOnScroll>
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-14 px-5 py-14 sm:px-8 sm:py-22 lg:grid-cols-2 lg:px-16">
          <div>
            <span className="flex items-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-orange before:content-[''] before:h-px before:w-[18px] before:bg-orange">
              AI at Work
            </span>
            <h2 className="mt-4 text-[clamp(1.8rem,3.4vw,2.7rem)] font-semibold">
              Don&apos;t Just Use AI. <em className="text-orange not-italic">Put It to Work.</em>
            </h2>
            <p className="mt-4.5 max-w-[56ch] text-[clamp(1.05rem,1.4vw,1.2rem)] text-paper-dim">
              AI is more than a chatbot. We help organisations identify where AI can actually save time, reduce
              costs, improve decision-making, and automate work.
            </p>

            <ul className="mt-8 grid grid-cols-1 border-t border-line sm:grid-cols-2">
              {AI_EXAMPLES.map((example) => (
                <li
                  key={example}
                  className="flex items-baseline gap-3 border-b border-line px-1 py-3.5 text-[0.95rem]"
                >
                  <span className="font-mono text-orange">—</span>
                  {example}
                </li>
              ))}
            </ul>

            <div className="mt-11">
              <Button href="#contact">Explore AI for My Business</Button>
            </div>
          </div>

          <div aria-hidden className="h-85 w-full">
            <svg viewBox="0 0 340 340" width="100%" height="100%">
              <defs>
                <radialGradient id="hero-hex-gradient" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#E07B2A" />
                  <stop offset="100%" stopColor="#6B1F2A" />
                </radialGradient>
              </defs>
              <g stroke="rgba(247,241,236,0.22)" strokeWidth="1">
                {NODE_POSITIONS.map(([x, y]) => (
                  <line key={`${x}-${y}`} x1="170" y1="170" x2={x} y2={y} />
                ))}
              </g>
              <circle cx="170" cy="170" r="34" fill="url(#hero-hex-gradient)" />
              <g fill="#18100E" stroke="#E07B2A" strokeWidth="1.5">
                {NODE_POSITIONS.map(([x, y]) => (
                  <circle key={`${x}-${y}-node`} cx={x} cy={y} r="15" />
                ))}
              </g>
            </svg>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
