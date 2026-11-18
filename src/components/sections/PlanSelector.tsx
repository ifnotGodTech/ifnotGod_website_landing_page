"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/shared/cn";
import type { PlanId } from "@/types/catalogue";

export type PlanOption = {
  id: PlanId;
  name: string;
  price: string;
  tag: string;
  panel: ReactNode;
};

type PlanSelectorProps = {
  options: PlanOption[];
  initialPlanId: PlanId;
};

// Each panel is rendered on the server. This only controls which one is shown, and the
// `noscript` rule in PricingPlans shows them all to visitors without JavaScript.
export function PlanSelector({ options, initialPlanId }: PlanSelectorProps) {
  const [selectedId, setSelectedId] = useState(initialPlanId);

  return (
    <>
      <div role="group" aria-label="Choose a plan" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {options.map((option) => {
          const selected = option.id === selectedId;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              aria-controls={`plan-panel-${option.id}`}
              onClick={() => setSelectedId(option.id)}
              className={cn(
                "flex min-h-31 cursor-pointer flex-col gap-1.5 rounded-[10px] border-2 p-5 text-left transition-colors",
                selected
                  ? "border-maroon bg-maroon text-paper"
                  : "border-line-light bg-white text-on-light hover:border-maroon"
              )}
            >
              <span className="font-display text-[1.35rem] font-extrabold">{option.name}</span>
              <span
                data-testid="plan-option-price"
                className="whitespace-nowrap font-display text-[1.3rem] font-extrabold leading-[1.15] tracking-[-0.02em]"
              >
                {option.price}
              </span>
              <span className={cn("text-[0.88rem]", selected ? "text-paper" : "text-on-light-dim")}>{option.tag}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {options.map((option) => (
          <div
            key={option.id}
            id={`plan-panel-${option.id}`}
            data-plan-panel
            className={option.id === selectedId ? "block" : "hidden"}
          >
            {option.panel}
          </div>
        ))}
      </div>
    </>
  );
}
