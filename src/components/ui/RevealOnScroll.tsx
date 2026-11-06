import type { ReactNode } from "react";
import { cn } from "@/shared/cn";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
};

// CSS-only (see `.reveal` in globals.css): content stays visible without JavaScript,
// with reduced motion, and in browsers without scroll-driven animation support.
export function RevealOnScroll({ children, className }: RevealOnScrollProps) {
  return <div className={cn("reveal", className)}>{children}</div>;
}
