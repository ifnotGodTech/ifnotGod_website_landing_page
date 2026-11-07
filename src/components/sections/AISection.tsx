import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

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
          "radial-gradient(circle at 85% 20%, color-mix(in srgb, var(--color-orange) 12%, transparent), transparent 45%), linear-gradient(180deg, color-mix(in srgb, var(--color-maroon) 16%, transparent), var(--color-ink) 75%)",
      }}
    >
      <RevealOnScroll>
        <Container className="grid grid-cols-1 items-start gap-14 py-14 sm:py-22 lg:grid-cols-2">
          <div>
            <Eyebrow>AI at Work</Eyebrow>
            <h2 className="mt-4 text-[clamp(1.8rem,3.4vw,2.7rem)] font-semibold">
              Don&apos;t Just Use AI.
              <br />
              <em className="text-orange not-italic">Put It to Work.</em>
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
                <radialGradient id="ai-hub-gradient" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="var(--color-orange)" />
                  <stop offset="100%" stopColor="var(--color-maroon)" />
                </radialGradient>
              </defs>
              <g className="stroke-paper/22" strokeWidth="1">
                {NODE_POSITIONS.map(([x, y]) => (
                  <line key={`${x}-${y}`} x1="170" y1="170" x2={x} y2={y} />
                ))}
              </g>
              <circle cx="170" cy="170" r="34" fill="url(#ai-hub-gradient)" />
              <g className="fill-surface stroke-orange" strokeWidth="1.5">
                {NODE_POSITIONS.map(([x, y]) => (
                  <circle key={`${x}-${y}-node`} cx={x} cy={y} r="15" />
                ))}
              </g>
            </svg>
          </div>
        </Container>
      </RevealOnScroll>
    </section>
  );
}
