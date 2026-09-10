import type { ReactNode } from "react";
import { cn } from "@/shared/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  center?: boolean;
  className?: string;
};

export function SectionHeading({ eyebrow, title, children, center, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex max-w-[60ch] flex-col gap-4", center && "mx-auto items-center text-center", className)}>
      <span className="flex items-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-orange before:content-[''] before:h-px before:w-[18px] before:bg-orange">
        {eyebrow}
      </span>
      <h2 className="text-[clamp(1.8rem,3.4vw,2.7rem)] font-semibold">{title}</h2>
      {children}
    </div>
  );
}
