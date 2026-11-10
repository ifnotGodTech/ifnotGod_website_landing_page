import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaymentDueNotice } from "./PaymentDueNotice";

describe("PaymentDueNotice", () => {
  it("says how long the plan keeps working, with a link to pay", () => {
    render(<PaymentDueNotice due={{ amount: 40000, workingUntil: "2026-11-14", payUrl: "https://checkout.flutterwave.com/x" }} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Your renewal payment hasn't gone through yet. Everything keeps working until 14 November 2026.");
    expect(screen.getByRole("link", { name: "Pay ₦40,000" })).toHaveAttribute("href", "https://checkout.flutterwave.com/x");
  });

  it("points to the email when there's no link to show", () => {
    render(<PaymentDueNotice due={{ amount: null, workingUntil: "2026-11-14", payUrl: null }} />);

    expect(screen.getByRole("alert")).toHaveTextContent("We've emailed you a link to pay.");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
