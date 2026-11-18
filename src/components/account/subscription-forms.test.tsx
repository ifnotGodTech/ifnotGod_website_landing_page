import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getBillingTerms, getPlans } from "@/lib/catalogue";
import { BILLING_PERIODS, buildQuote, type Quote } from "@/lib/accounts/billing";
import { formatNaira } from "@/lib/catalogue/rules";
import { ServicesForm } from "./ServicesForm";
import { SubscribeForm } from "./SubscribeForm";

const BILLING_TERMS = await getBillingTerms();
const priced = (await getPlans()).filter((plan) => plan.monthlyPrice !== null);
const quotes: Record<string, Quote> = {};
const totals: Record<string, string> = {};
for (const plan of priced) {
  for (const period of BILLING_PERIODS) {
    quotes[`${plan.id}:${period.id}`] = buildQuote(plan, period.id, BILLING_TERMS);
    totals[`${plan.id}:${period.id}`] = formatNaira(quotes[`${plan.id}:${period.id}`].dueToday);
  }
}

function renderSubscribe() {
  render(
    <SubscribeForm
      action={vi.fn(async () => ({ formError: null }))}
      plans={priced.map((plan) => ({ id: plan.id, name: plan.name, detail: "" }))}
      periods={BILLING_PERIODS.map((period) => ({ id: period.id, name: period.label, detail: "" }))}
      quotes={quotes}
      totals={totals}
      initialPlan="growth"
      initialPeriod="monthly"
    />
  );
}

describe("subscribe form", () => {
  it("starts on the chosen plan, paying monthly with the setup fee", () => {
    renderSubscribe();

    expect(screen.getByRole("radio", { name: /Growth/ })).toBeChecked();
    expect(screen.getByRole("button", { name: "Pay ₦140,000 with Flutterwave" })).toBeInTheDocument();
    expect(screen.getByText("One-time setup fee")).toBeInTheDocument();
  });

  it("updates the total as the plan and payment option change", async () => {
    const user = userEvent.setup();
    renderSubscribe();

    await user.click(screen.getByRole("radio", { name: /Pro/ }));
    await user.click(screen.getByRole("radio", { name: /12 months upfront/ }));

    expect(screen.getByRole("button", { name: "Pay ₦800,000 with Flutterwave" })).toBeInTheDocument();
    expect(screen.getByText("2 months free")).toBeInTheDocument();
  });
});

describe("services form", () => {
  const groups = [
    { id: "everyday", name: "Everyday automations", limit: 2, services: ["A", "B", "C"].map((name) => ({ id: name, name })) },
  ];

  it("counts choices and stops at the plan's limit", async () => {
    const user = userEvent.setup();
    render(<ServicesForm action={vi.fn(async () => ({ formError: null }))} groups={groups} selected={["A"]} submitLabel="Save" />);

    expect(screen.getByText("1 of 2 chosen")).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "B" }));

    expect(screen.getByText("2 of 2 chosen")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "C" })).toBeDisabled();
    expect(screen.getByText(/unselect one first/)).toBeInTheDocument();
  });

  it("sends every chosen service", async () => {
    const action = vi.fn(async () => ({ formError: null }));
    const user = userEvent.setup();
    render(<ServicesForm action={action} groups={groups} selected={["A", "C"]} submitLabel="Save" />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    const sent = (action.mock.calls[0] as unknown as [unknown, FormData])[1];
    expect(sent.getAll("service")).toEqual(["A", "C"]);
  });
});
