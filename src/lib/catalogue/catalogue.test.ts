import { describe, expect, it } from "vitest";
import type { PlanId, ServiceGroupId } from "@/types/catalogue";
import { getPlan, getPlanChoices, getPlans, getServiceGroups } from "./index";

const allServices = async () => (await getServiceGroups()).flatMap((group) => group.services);

async function choiceCounts(planId: PlanId) {
  const choices = await getPlanChoices(planId);
  return Object.fromEntries(choices.map((choice) => [choice.group.id, choice.services.length]));
}

describe("plans", () => {
  it("lists the four plans from lowest to highest", async () => {
    expect((await getPlans()).map((plan) => plan.id)).toEqual(["starter", "growth", "pro", "custom"]);
  });

  it.each([
    ["starter", 60_000],
    ["growth", 150_000],
    ["pro", 300_000],
    ["custom", null],
  ] as const)("%s costs %s a month", async (id, price) => {
    expect((await getPlan(id))?.monthlyPrice).toBe(price);
  });

  it("recommends only Growth", async () => {
    const recommended = (await getPlans()).filter((plan) => plan.recommended);

    expect(recommended.map((plan) => plan.id)).toEqual(["growth"]);
  });
});

describe("services", () => {
  it("has all 17 services, with no repeated ids", async () => {
    const ids = (await allServices()).map((service) => service.id);

    expect(ids).toHaveLength(17);
    expect(new Set(ids).size).toBe(17);
  });

  it("groups them as everyday, social and agents", async () => {
    const groups = await getServiceGroups();

    expect(groups.map((group) => [group.id, group.services.length])).toEqual([
      ["everyday", 7],
      ["social", 6],
      ["agents", 4],
    ]);
  });

  it("shows every service as available", async () => {
    (await allServices()).forEach((service) => expect(service.available).toBe(true));
  });

  it("tells clients the call agent's minutes are billed separately", async () => {
    const callAgent = (await allServices()).find((service) => service.id === "ai-call-agent");

    expect(callAgent?.note).toBe("Minutes billed separately.");
  });
});

describe("what each plan can choose from", () => {
  it.each([
    ["starter", { everyday: 7, social: 3 }],
    ["growth", { everyday: 7, social: 6, agents: 2 }],
    ["pro", { everyday: 7, social: 6, agents: 4 }],
    ["custom", { everyday: 7, social: 6, agents: 4 }],
  ] as const)("%s", async (planId, counts) => {
    expect(await choiceCounts(planId)).toEqual(counts);
  });

  it.each([
    ["starter", ["1 everyday automation", "1 social or content service"]],
    ["growth", ["3 everyday automations", "2 social or content services", "1 AI agent"]],
    ["pro", ["6 everyday automations", "4 social or content services", "2 AI agents"]],
    ["custom", ["Everyday automations", "Social and content", "AI agents"]],
  ] as const)("%s describes its allowances", async (planId, labels) => {
    const choices = await getPlanChoices(planId);

    expect(choices.map((choice) => choice.label)).toEqual(labels);
  });

  it("keeps the call agent and document reader for Pro and above", async () => {
    const agentIds = async (planId: PlanId) =>
      (await getPlanChoices(planId)).find((choice) => choice.group.id === "agents")?.services.map((s) => s.id);

    expect(await agentIds("growth")).toEqual(["whatsapp-sales-agent", "staff-assistant"]);
    expect(await agentIds("pro")).toContain("ai-call-agent");
    expect(await agentIds("pro")).toContain("document-reader");
  });

  it("never allows more choices than a plan has services to choose from", async () => {
    for (const plan of await getPlans()) {
      const choices = await getPlanChoices(plan.id);

      for (const groupId of Object.keys(plan.allowances) as ServiceGroupId[]) {
        const allowance = plan.allowances[groupId];
        if (typeof allowance !== "number") continue;

        const offered = choices.find((choice) => choice.group.id === groupId)?.services.length ?? 0;
        expect(allowance, `${plan.id} ${groupId}`).toBeLessThanOrEqual(offered);
      }
    }
  });
});
