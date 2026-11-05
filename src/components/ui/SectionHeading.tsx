import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
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
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-[clamp(1.8rem,3.4vw,2.7rem)] font-semibold">{title}</h2>
      {children}
    </div>
  );
}
