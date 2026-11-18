import { describe, expect, it } from "vitest";
import type { PlanChoice } from "@/types/catalogue";
import { checkServiceSelection, selfServiceChoices } from "./serviceSelection";

const service = (id: string, catchAll = false) => ({
  id,
  group: "everyday" as const,
  name: id,
  problem: "",
  plans: ["starter" as const],
  available: true,
  catchAll,
});

const choices: PlanChoice[] = [
  {
    group: { id: "everyday", name: "Everyday", unitSingular: "", unitPlural: "" },
    allowance: 2,
    label: "2 everyday automations",
    services: [service("a"), service("b"), service("c"), service("any", true)],
  },
];

describe("checkServiceSelection", () => {
  it("lets a client choose their first services without using a change", () => {
    expect(checkServiceSelection(choices, [], ["a", "b"], 0)).toEqual({ ok: true, changesUsed: 0 });
  });

  it("counts each swapped service as one change", () => {
    expect(checkServiceSelection(choices, ["a", "b"], ["a", "c"], 1)).toEqual({ ok: true, changesUsed: 1 });
  });

  it("allows dropping a service without using a change", () => {
    expect(checkServiceSelection(choices, ["a", "b"], ["a"], 0)).toEqual({ ok: true, changesUsed: 0 });
  });

  it("refuses swaps beyond the changes left", () => {
    expect(checkServiceSelection(choices, ["a", "b"], ["c", "a"], 0)).toEqual({ ok: false, error: "NO_CHANGES_LEFT" });
  });

  it.each([
    ["more than the plan allows", ["a", "b", "c"]],
    ["a service the plan doesn't offer", ["a", "z"]],
    ["the same service twice", ["a", "a"]],
  ])("refuses %s", (_, next) => {
    expect(checkServiceSelection(choices, [], next, 5)).toEqual({ ok: false, error: "INVALID_SELECTION" });
  });

  it("leaves the catch-all task out of what clients pick themselves", () => {
    expect(selfServiceChoices(choices)[0].services.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });
});
