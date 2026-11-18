import { describe, expect, it } from "vitest";
import type { Plan, Service, ServiceGroup } from "@/types/catalogue";
import {
  allowanceLabel,
  buildPlanChoices,
  formatNaira,
  formatPlanPrice,
  groupAllowanceSummary,
  isIncludedInPlan,
  listedServices,
  planHighlights,
  servicePlansLabel,
} from "./rules";

const group: ServiceGroup = { id: "agents", name: "AI agents", unitSingular: "AI agent", unitPlural: "AI agents" };

const service = (overrides: Partial<Service>): Service => ({
  id: "service",
  group: "agents",
  name: "Service",
  problem: "A problem.",
  plans: ["starter", "growth", "pro"],
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
  changes: "",
  lines: [],
  monthlyChanges: 1,
  ...overrides,
});

describe("formatNaira", () => {
  it("shows the naira sign and thousands separators, with no kobo", () => {
    expect(formatNaira(150_000)).toBe("₦150,000");
  });
});

describe("formatPlanPrice", () => {
  it("shows a monthly price", () => {
    expect(formatPlanPrice(plan({ monthlyPrice: 60_000 }))).toBe("₦60,000 / month");
  });

  it("invites a conversation when the price is quoted", () => {
    expect(formatPlanPrice(plan({ monthlyPrice: null }))).toBe("Let's talk");
  });
});

describe("isIncludedInPlan", () => {
  it.each([
    ["starter", true],
    ["growth", true],
    ["pro", true],
    ["custom", true],
  ] as const)("a service in every plan is on %s", (planId, expected) => {
    expect(isIncludedInPlan(service({ plans: ["starter", "growth", "pro"] }), planId)).toBe(expected);
  });

  it.each([
    ["starter", false],
    ["growth", false],
    ["pro", true],
    ["custom", true],
  ] as const)("a service only in Pro on %s: %s", (planId, expected) => {
    expect(isIncludedInPlan(service({ plans: ["pro"] }), planId)).toBe(expected);
  });

  it("follows the ticked plans, even when a higher plan is left out", () => {
    const starterOnly = service({ plans: ["starter"] });

    expect([isIncludedInPlan(starterOnly, "starter"), isIncludedInPlan(starterOnly, "pro"), isIncludedInPlan(starterOnly, "custom")]).toEqual([
      true,
      false,
      true,
    ]);
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

describe("listedServices", () => {
  it("leaves out the catch-all entry", () => {
    const listed = service({ id: "listed" });

    expect(listedServices([listed, service({ id: "other", catchAll: true })])).toEqual([listed]);
  });
});

describe("servicePlansLabel", () => {
  const plans = [
    plan({ id: "starter", name: "Starter" }),
    plan({ id: "growth", name: "Growth" }),
    plan({ id: "pro", name: "Pro" }),
    plan({ id: "custom", name: "Custom", monthlyPrice: null }),
  ];

  it.each([
    [["starter", "growth", "pro"], "From Starter"],
    [["growth", "pro"], "From Growth"],
    [["pro"], "From Pro"],
    [["starter"], "Starter only"],
    [["starter", "pro"], "In Starter and Pro"],
    [["starter", "growth"], "In Starter and Growth"],
    [[], ""],
  ] as const)("describes a service in %j as %j", (ids, label) => {
    expect(servicePlansLabel(service({ plans: [...ids] }), plans)).toBe(label);
  });
});

describe("groupAllowanceSummary", () => {
  const agents = (id: "starter" | "growth" | "pro" | "custom", name: string, count: number | "agreed") =>
    plan({ id, name, allowances: { everyday: 1, social: 1, agents: count } });

  it("names each plan's allowance, leaving out plans with none or an agreed number", () => {
    const plans = [agents("starter", "Starter", 0), agents("growth", "Growth", 1), agents("pro", "Pro", 2), agents("custom", "Custom", "agreed")];

    expect(groupAllowanceSummary(group, plans)).toBe("Growth includes 1, Pro 2");
  });
});

describe("planHighlights", () => {
  it("lists a plan's allowances, then its website, its first line", () => {
    const growth = plan({ lines: ["Landing page", "Priority WhatsApp support"] });
    const choices = buildPlanChoices(growth, [group], [service({})]);

    expect(planHighlights(growth, choices)).toEqual(["1 AI agent", "Landing page"]);
  });

  it("leaves the website out when a plan lists nothing else", () => {
    const growth = plan({ lines: [] });

    expect(planHighlights(growth, buildPlanChoices(growth, [group], [service({})]))).toEqual(["1 AI agent"]);
  });

  describe("naming an example service", () => {
    const pro = plan({ lines: ["Site"], highlightExample: { serviceId: "call", label: "the call agent" } });

    it("adds the example to the group that offers it", () => {
      const choices = buildPlanChoices(pro, [group], [service({ id: "call" })]);

      expect(planHighlights(pro, choices)).toEqual(["1 AI agent, such as the call agent", "Site"]);
    });

    it("drops the example when that service isn't on offer", () => {
      const choices = buildPlanChoices(pro, [group], [service({ id: "other" }), service({ id: "call", available: false })]);

      expect(planHighlights(pro, choices)).toEqual(["1 AI agent", "Site"]);
    });
  });

  it("describes a quoted plan in words, not allowances", () => {
    const custom = plan({ monthlyPrice: null, lines: ["Larger apps"], tag: "Quoted after the audit" });

    expect(planHighlights(custom, [])).toEqual([
      "Everything agreed around your needs",
      "Larger apps",
      "Quoted after the audit",
    ]);
  });
});

describe("buildPlanChoices", () => {
  it("offers only services the plan includes", () => {
    const included = service({ id: "included", plans: ["growth", "pro"] });
    const higher = service({ id: "higher", plans: ["pro"] });

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
