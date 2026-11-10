import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  confirmPayment: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect, usePathname: () => "/" }));
vi.mock("@/lib/accounts", () => ({ requireSession: async () => ({ user: { id: "7" }, token: "t0ken" }) }));
vi.mock("@/lib/accounts/subscriptions", () => ({ confirmPayment: mocks.confirmPayment }));

import PaidPage from "./(account)/account/subscribe/paid/page";

const props = (searchParams: Record<string, string>) => ({ params: Promise.resolve({}), searchParams: Promise.resolve(searchParams) });

describe("back from Flutterwave", () => {
  beforeEach(() => mocks.confirmPayment.mockReset());

  it("sends a renewed client back to their account", async () => {
    mocks.confirmPayment.mockResolvedValueOnce({ ok: true, value: { subscription: {}, renewal: true } });

    await expect(PaidPage(props({ status: "successful", tx_ref: "ifng-2", transaction_id: "778" }))).rejects.toThrow(
      "REDIRECT /account?updated=renewed"
    );
  });

  it("has the backend confirm the payment, then goes on to choosing services", async () => {
    mocks.confirmPayment.mockResolvedValueOnce({ ok: true, value: { subscription: {}, renewal: false } });

    await expect(PaidPage(props({ status: "successful", tx_ref: "ifng-1", transaction_id: "777" }))).rejects.toThrow(
      "REDIRECT /account/services?welcome=1"
    );
    expect(mocks.confirmPayment).toHaveBeenCalledWith("t0ken", "ifng-1", 777);
  });

  it("says a cancelled payment charged nothing, without asking the backend", async () => {
    render(await PaidPage(props({ status: "cancelled", tx_ref: "ifng-1" })));

    expect(screen.getByRole("heading", { level: 1, name: "Payment cancelled" })).toBeInTheDocument();
    expect(mocks.confirmPayment).not.toHaveBeenCalled();
  });

  it("explains a payment Flutterwave hasn't confirmed, with a way to try again", async () => {
    mocks.confirmPayment.mockResolvedValueOnce({ ok: false, error: "PAYMENT_NOT_COMPLETED" });

    render(await PaidPage(props({ status: "successful", tx_ref: "ifng-1" })));

    expect(screen.getByRole("heading", { level: 1, name: "Payment not confirmed" })).toBeInTheDocument();
    expect(screen.getByText(/hasn't gone through/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Choose a plan and try again" })).toHaveAttribute("href", "/account/subscribe");
    expect(mocks.confirmPayment).toHaveBeenCalledWith("t0ken", "ifng-1", null);
  });
});
