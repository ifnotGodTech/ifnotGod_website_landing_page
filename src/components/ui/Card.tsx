import type { ReactNode } from "react";
import { cn } from "@/shared/cn";

type CardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  size?: "sm" | "lg";
};

export function Card({ icon, title, description, size = "sm" }: CardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 bg-ink transition-colors duration-200",
        "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-maroon before:to-orange before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100",
        "hover:bg-gradient-to-b hover:from-maroon/15 hover:to-surface",
        size === "lg" ? "p-9" : "p-7"
      )}
    >
      <div className="text-orange [&>svg]:h-7.5 [&>svg]:w-7.5">{icon}</div>
      <h3 className={cn("font-semibold", size === "lg" ? "font-display text-[1.18rem]" : "text-[1.02rem]")}>
        {title}
      </h3>
      <p className="text-[0.92rem] text-paper-dim">{description}</p>
    </div>
  );
}
