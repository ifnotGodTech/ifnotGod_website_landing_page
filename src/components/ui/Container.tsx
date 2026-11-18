import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/cn";

type Width = "default" | "narrow";

const widthClasses: Record<Width, string> = {
  default: "max-w-[1180px] px-5 sm:px-8 lg:px-16",
  narrow: "max-w-[860px] px-5 sm:px-8",
};

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  width?: Width;
};

export function Container({ width = "default", className, children, ...rest }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full", widthClasses[width], className)} {...rest}>
      {children}
    </div>
  );
}
