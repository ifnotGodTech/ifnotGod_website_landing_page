import { listedServices } from "@/lib/catalogue/rules";
import type { PlanChoice } from "@/types/catalogue";

export type SelectionCheck =
  | { ok: true; changesUsed: number }
  | { ok: false; error: "INVALID_SELECTION" | "NO_CHANGES_LEFT" };

/**
 * Checks a client's new set of services against their plan. Choosing services for the first
 * time is free. After that, each service added in place of another uses one monthly change.
 */
export function checkServiceSelection(
  choices: PlanChoice[],
  current: string[],
  next: string[],
  changesLeft: number
): SelectionCheck {
  if (new Set(next).size !== next.length) return { ok: false, error: "INVALID_SELECTION" };

  const offered = new Set(choices.flatMap((choice) => choice.services.map((service) => service.id)));
  if (next.some((id) => !offered.has(id))) return { ok: false, error: "INVALID_SELECTION" };

  for (const choice of choices) {
    if (choice.allowance === "agreed") continue;
    const picked = choice.services.filter((service) => next.includes(service.id)).length;
    if (picked > choice.allowance) return { ok: false, error: "INVALID_SELECTION" };
  }

  if (current.length === 0) return { ok: true, changesUsed: 0 };
  const changesUsed = next.filter((id) => !current.includes(id)).length;
  if (changesUsed > changesLeft) return { ok: false, error: "NO_CHANGES_LEFT" };
  return { ok: true, changesUsed };
}

/** A plan's choices that clients pick themselves. The catch-all task is agreed in the audit instead. */
export function selfServiceChoices(choices: PlanChoice[]): PlanChoice[] {
  return choices.map((choice) => ({ ...choice, services: listedServices(choice.services) }));
}
