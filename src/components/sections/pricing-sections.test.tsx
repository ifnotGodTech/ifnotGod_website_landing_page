import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/(site)/pricing/page";
import { AUDIT_PATH } from "@/shared/constants";
import { PlanTerms } from "./PlanTerms";
import { PricingPlans } from "./PricingPlans";

const renderPlans = async () => render(await PricingPlans());
const planButton = (name: RegExp) => screen.getByRole("button", { name });
const panel = (id: string) => document.getElementById(`plan-panel-${id}`) as HTMLElement;

describe("plan selector", () => {
  it("offers all four plans with their prices", async () => {
    await renderPlans();

    expect(screen.getByRole("group", { name: "Choose a plan" })).toBeInTheDocument();
    expect(planButton(/Starter/)).toHaveTextContent("₦20,000 / month");
    expect(planButton(/Growth/)).toHaveTextContent("₦40,000 / month");
    expect(planButton(/Pro/)).toHaveTextContent("₦80,000 / month");
    expect(planButton(/Custom/)).toHaveTextContent("Let's talk");
  });

  it("selects Growth first", async () => {
    await renderPlans();

    expect(planButton(/Growth/)).toHaveAttribute("aria-pressed", "true");
    expect(planButton(/Starter/)).toHaveAttribute("aria-pressed", "false");
    expect(panel("growth")).toHaveClass("block");
    expect(panel("starter")).toHaveClass("hidden");
  });

  it("shows only the chosen plan after clicking", async () => {
    const user = userEvent.setup();
    await renderPlans();

    await user.click(planButton(/Pro/));

    expect(planButton(/Pro/)).toHaveAttribute("aria-pressed", "true");
    expect(planButton(/Growth/)).toHaveAttribute("aria-pressed", "false");
    expect(panel("pro")).toHaveClass("block");
    expect(panel("growth")).toHaveClass("hidden");
  });

  it("works from the keyboard", async () => {
    const user = userEvent.setup();
    await renderPlans();

    planButton(/Starter/).focus();
    await user.keyboard("{Enter}");
    expect(planButton(/Starter/)).toHaveAttribute("aria-pressed", "true");

    await user.tab();
    await user.keyboard(" ");
    expect(planButton(/Growth/)).toHaveAttribute("aria-pressed", "true");
  });

  it("renders every plan's details, so they're in the page without JavaScript", async () => {
    await renderPlans();

    ["starter", "growth", "pro", "custom"].forEach((id) => expect(panel(id)).toHaveTextContent("Also included"));
  });
});

describe("what each plan shows", () => {
  const groupHeadings = (id: string) =>
    within(panel(id))
      .getAllByRole("heading", { level: 3, hidden: true })
      .map((heading) => heading.textContent);

  it.each([
    ["starter", ["1 everyday automation", "1 social or content service", "Also included"]],
    ["growth", ["3 everyday automations", "2 social or content services", "1 AI agent", "Also included"]],
    ["pro", ["6 everyday automations", "4 social or content services", "2 AI agents", "Also included"]],
    ["custom", ["Everyday automations", "Social and content", "AI agents", "Also included"]],
  ])("%s lists its own allowances", async (id, headings) => {
    await renderPlans();

    expect(groupHeadings(id)).toEqual(headings);
  });

  it("gives Starter no AI agents and no Growth-level social services", async () => {
    await renderPlans();

    expect(panel("starter")).not.toHaveTextContent("WhatsApp sales agent");
    expect(panel("starter")).not.toHaveTextContent("DM assistant");
    expect(panel("starter")).toHaveTextContent("Scheduling and posting");
  });

  it("keeps Pro's agents off Growth", async () => {
    await renderPlans();

    expect(panel("growth")).toHaveTextContent("WhatsApp sales agent");
    expect(panel("growth")).not.toHaveTextContent("Document reader");
    expect(panel("growth")).not.toHaveTextContent("AI call agent");
    expect(panel("pro")).toHaveTextContent("AI call agent (Minutes billed separately.)");
  });

  it("only promises hosting for automations, not websites", async () => {
    await renderPlans();

    ["starter", "growth", "pro", "custom"].forEach((id) => {
      expect(panel(id)).toHaveTextContent("Hosting and monitoring for your automations");
      expect(panel(id)).toHaveTextContent("Website we build");
    });
  });

  it("shows each plan's website, changes and support", async () => {
    await renderPlans();

    expect(panel("starter")).toHaveTextContent("Landing or link-in-bio page");
    expect(panel("growth")).toHaveTextContent("Priority WhatsApp");
    expect(panel("pro")).toHaveTextContent("Priority WhatsApp and monthly review call");
    expect(panel("custom")).toHaveTextContent("Larger apps and platforms");
  });

  it("sends each plan's button to the audit with that plan", async () => {
    await renderPlans();

    expect(within(panel("growth")).getByRole("link", { hidden: true })).toHaveAttribute(
      "href",
      `${AUDIT_PATH}?plan=growth`
    );
    expect(within(panel("custom")).getByRole("link", { hidden: true })).toHaveTextContent("Talk to us");
  });
});

describe("plan terms and questions", () => {
  it("shows the fee, term and billing terms", () => {
    render(<PlanTerms />);

    expect(screen.getByText("One-time setup fee of ₦100,000, waived when you pay 6 months upfront.")).toBeInTheDocument();
    expect(screen.getByText("Pay month by month. There's no minimum term.")).toBeInTheDocument();
    expect(screen.getByText(/2 months free/)).toBeInTheDocument();
    expect(screen.getByText(/billed at cost/)).toBeInTheDocument();
  });

  it("lets clients cancel at the end of any month, with no minimum term", () => {
    const { container } = render(<PlanTerms />);

    expect(screen.getByText(/you can stop at the end of any month/)).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/3 months|3-month/);
  });

  it("answers questions with native disclosure elements, with no placeholders", () => {
    const { container } = render(<PlanTerms />);

    expect(container.querySelectorAll("details")).toHaveLength(3);
    expect(container).not.toHaveTextContent("TERMS TO CONFIRM");
  });
});

describe("pricing page metadata", () => {
  it("has its own title and canonical URL, and can be indexed", () => {
    expect(metadata.title).toContain("Plans and Prices");
    expect(metadata.alternates?.canonical).toBe("/pricing");
    expect(metadata.robots).toBeUndefined();
  });
});
