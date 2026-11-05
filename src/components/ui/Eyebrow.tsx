import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/cn";

export function Eyebrow({ className, children, ...rest }: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-orange before:h-px before:w-[18px] before:bg-orange before:content-['']",
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
