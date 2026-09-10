import { Button } from "@/components/ui/Button";

export function FloatingCta() {
  return (
    <Button
      href="#contact"
      size="sm"
      className="fixed right-4 bottom-6.5 z-90 shadow-[0_10px_30px_rgba(0,0,0,0.45)] sm:right-8"
    >
      Let&apos;s Solve Your Problem
    </Button>
  );
}
