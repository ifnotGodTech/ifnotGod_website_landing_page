import { describe, expect, it, vi } from "vitest";
import { getPlanChoices, getServiceGroups } from "./index";

// Takes one service and a whole group off the site, as the dashboard will be able to.
vi.mock("@/content/services", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/content/services")>();
  return {
    ...original,
    SERVICES: original.SERVICES.map((service) => ({
      ...service,
      available: service.id !== "lead-follow-up" && service.group !== "agents",
    })),
  };
});

describe("when services are taken off the site", () => {
  it("removes them from the service list", async () => {
    const ids = (await getServiceGroups()).flatMap((group) => group.services.map((service) => service.id));

    expect(ids).not.toContain("lead-follow-up");
    expect(ids).toHaveLength(12);
  });

  it("removes them from what every plan can choose", async () => {
    for (const planId of ["starter", "growth", "pro", "custom"] as const) {
      const ids = (await getPlanChoices(planId)).flatMap((choice) => choice.services.map((service) => service.id));

      expect(ids).not.toContain("lead-follow-up");
    }
  });

  it("hides a group with nothing left in it", async () => {
    expect((await getServiceGroups()).map((group) => group.id)).toEqual(["everyday", "social"]);
    expect((await getPlanChoices("pro")).map((choice) => choice.group.id)).toEqual(["everyday", "social"]);
  });
});
