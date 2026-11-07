import { describe, expect, it } from "vitest";
import type { Plan, Service, ServiceGroup } from "@/types/catalogue";
import { allowanceLabel, buildPlanChoices, formatNaira, isIncludedInPlan } from "./rules";

const group: ServiceGroup = { id: "agents", name: "AI agents", unitSingular: "AI agent", unitPlural: "AI agents" };

const service = (overrides: Partial<Service>): Service => ({
  id: "service",
  group: "agents",
  name: "Service",
  problem: "A problem.",
  includedFrom: "starter",
  available: true,
  ...overrides,
});

const plan = (overrides: Partial<Plan>): Plan => ({
  id: "growth",
  name: "Growth",
  monthlyPrice: 1,
  tag: "",
  summary: "",
  ctaLabel: "",
  recommended: false,
  allowances: { everyday: 1, social: 1, agents: 1 },
  website: "",
  changes: "",
  support: "",
  ...overrides,
});

describe("formatNaira", () => {
  it("shows the naira sign and thousands separators, with no kobo", () => {
    expect(formatNaira(150_000)).toBe("₦150,000");
  });
});

describe("isIncludedInPlan", () => {
  it.each([
    ["starter", true],
    ["growth", true],
    ["pro", true],
    ["custom", true],
  ] as const)("a service from Starter is on %s", (planId, expected) => {
    expect(isIncludedInPlan(service({ includedFrom: "starter" }), planId)).toBe(expected);
  });

  it.each([
    ["starter", false],
    ["growth", false],
    ["pro", true],
    ["custom", true],
  ] as const)("a service from Pro on %s: %s", (planId, expected) => {
    expect(isIncludedInPlan(service({ includedFrom: "pro" }), planId)).toBe(expected);
  });
});

describe("allowanceLabel", () => {
  it.each([
    [1, "1 AI agent"],
    [2, "2 AI agents"],
    ["agreed", "AI agents"],
  ] as const)("describes an allowance of %s", (allowance, label) => {
    expect(allowanceLabel(group, allowance)).toBe(label);
  });
});

describe("buildPlanChoices", () => {
  it("offers only services the plan includes", () => {
    const included = service({ id: "included", includedFrom: "growth" });
    const higher = service({ id: "higher", includedFrom: "pro" });

    const [choice] = buildPlanChoices(plan({}), [group], [included, higher]);

    expect(choice.services).toEqual([included]);
  });

  it("never offers an unavailable service", () => {
    const shown = service({ id: "shown" });
    const hidden = service({ id: "hidden", available: false });

    const [choice] = buildPlanChoices(plan({}), [group], [shown, hidden]);

    expect(choice.services).toEqual([shown]);
  });

  it("leaves out a group the plan has no allowance for, even if services would qualify", () => {
    const noAgents = plan({ allowances: { everyday: 1, social: 1, agents: 0 } });

    expect(buildPlanChoices(noAgents, [group], [service({})])).toEqual([]);
  });

  it("leaves out a group when all its services are unavailable", () => {
    expect(buildPlanChoices(plan({}), [group], [service({ available: false })])).toEqual([]);
  });

  it("keeps only services from the matching group", () => {
    const other = service({ id: "other", group: "social" });

    expect(buildPlanChoices(plan({}), [group], [other])).toEqual([]);
  });

  it("labels the choice with the plan's allowance", () => {
    const twoAgents = plan({ allowances: { everyday: 1, social: 1, agents: 2 } });

    const [choice] = buildPlanChoices(twoAgents, [group], [service({})]);

    expect(choice).toMatchObject({ group, allowance: 2, label: "2 AI agents" });
  });
});
