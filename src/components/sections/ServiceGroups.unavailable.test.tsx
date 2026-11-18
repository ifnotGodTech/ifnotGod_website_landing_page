import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceGroups } from "./ServiceGroups";

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
  it("doesn't show them", async () => {
    render(await ServiceGroups());

    expect(screen.queryByText("Lead follow-up")).not.toBeInTheDocument();
    expect(screen.getByText("Daily business brief")).toBeInTheDocument();
  });

  it("doesn't show a group with nothing left in it", async () => {
    render(await ServiceGroups());

    expect(screen.queryByRole("heading", { name: "AI agents" })).not.toBeInTheDocument();
    expect(screen.queryByText(/hands over to a person/)).not.toBeInTheDocument();
  });
});
