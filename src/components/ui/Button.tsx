import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/cn";

type Variant = "primary" | "ghost" | "outline-orange";
type Size = "md" | "sm";

const variantClasses: Record<Variant, string> = {
  primary: "bg-maroon text-paper hover:bg-maroon-bright",
  ghost: "border border-line-strong text-paper bg-transparent hover:border-orange hover:text-orange",
  "outline-orange": "border border-orange text-orange bg-transparent hover:bg-orange hover:text-ink",
};

const sizeClasses: Record<Size, string> = {
  md: "px-[26px] py-[14px] text-sm",
  sm: "px-[18px] py-[10px] text-[0.85rem]",
};

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[3px] transition-[background-color,color,border-color,transform] duration-200 ease-out hover:-translate-y-px whitespace-nowrap";

type ButtonProps = ComponentPropsWithoutRef<"a"> & {
  href: string;
  variant?: Variant;
  size?: Size;
};

export function Button({ href, variant = "primary", size = "md", className, children, ...rest }: ButtonProps) {
  const isInternalRoute = href.startsWith("/");
  const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

  if (isInternalRoute) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}
