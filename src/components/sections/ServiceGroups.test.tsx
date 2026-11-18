import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServiceGroups } from "./ServiceGroups";

const renderGroups = async () => render(await ServiceGroups());
const serviceItem = (name: string) => screen.getByRole("heading", { level: 3, name }).closest("li") as HTMLElement;
const groupSection = (name: string) => screen.getByRole("heading", { level: 2, name }).closest("section") as HTMLElement;

describe("service groups", () => {
  it("shows the three groups, in order", async () => {
    await renderGroups();

    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
      "Everyday automations",
      "Social and content",
      "AI agents",
    ]);
  });

  it.each([
    ["Everyday automations", "Starter includes 1, Growth 3, Pro 6"],
    ["Social and content", "Starter includes 1, Growth 2, Pro 4"],
    ["AI agents", "Growth includes 1, Pro 2"],
  ])("%s says how many each plan includes", async (name, summary) => {
    await renderGroups();

    expect(groupSection(name)).toHaveTextContent(summary);
  });

  it.each([
    ["Everyday automations", 6],
    ["Social and content", 6],
    ["AI agents", 4],
  ])("%s lists %i services", async (name, count) => {
    await renderGroups();

    expect(within(groupSection(name)).getAllByRole("listitem")).toHaveLength(count);
  });

  it("leaves the catch-all task off the list, because the page points to the audit instead", async () => {
    await renderGroups();

    expect(screen.queryByText(/Any similar-sized task/)).not.toBeInTheDocument();
  });

  it("shows each service's problem in the client's words", async () => {
    await renderGroups();

    expect(serviceItem("Lead follow-up")).toHaveTextContent("“We forget to call people back.”");
    expect(serviceItem("WhatsApp sales agent")).toHaveTextContent("“Customers ask at night and buy elsewhere.”");
  });

  it.each([
    ["Lead follow-up", "From Starter"],
    ["Scheduling and posting", "From Starter"],
    ["DM assistant", "From Growth"],
    ["WhatsApp sales agent", "From Growth"],
    ["Document reader", "From Pro"],
    ["AI call agent", "From Pro"],
  ])("%s is labelled %s", async (name, label) => {
    await renderGroups();

    expect(serviceItem(name)).toHaveTextContent(label);
  });

  it("says the call agent's minutes are billed separately", async () => {
    await renderGroups();

    expect(serviceItem("AI call agent")).toHaveTextContent("Minutes billed separately.");
  });

  it("tells clients that agents hand over to a person", async () => {
    await renderGroups();

    expect(groupSection("AI agents")).toHaveTextContent("hands over to a person");
  });
});
