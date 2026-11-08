import { beforeEach, describe, expect, it } from "vitest";
import type { AccountUser } from "@/types/account";
import { createStubBackend, decodeReference } from "./stub";
import { memoryStubStore } from "./stubStore";

const ada: AccountUser = { id: "ada", fullName: "Ada Obi", email: "ada@example.com", signInMethod: "password" };
const bola: AccountUser = { ...ada, id: "bola" };

const reference = (redirectTo: string) => new URL(redirectTo, "http://x").searchParams.get("ref")!;

describe("stand-in subscriptions", () => {
  let backend: ReturnType<typeof createStubBackend>;

  beforeEach(() => {
    backend = createStubBackend(memoryStubStore(), () => "2026-11-08");
  });

  async function subscribe(user = ada, planId: "starter" | "growth" | "pro" = "growth", billingPeriod: "monthly" | "six-months" | "twelve-months" = "monthly") {
    const checkout = await backend.startCheckout(user, { planId, billingPeriod });
    if (!checkout.ok) throw new Error(checkout.error);
    return backend.confirmCheckout(user, reference(checkout.value.redirectTo));
  }

  it("starts with no subscription", async () => {
    expect(await backend.getSubscription(ada)).toEqual({ ok: true, value: null });
  });

  it("sends the client to pay, carrying their choice", async () => {
    const checkout = await backend.startCheckout(ada, { planId: "pro", billingPeriod: "six-months" });

    expect(checkout.ok && decodeReference(reference(checkout.value.redirectTo))).toEqual({ planId: "pro", billingPeriod: "six-months" });
  });

  it("refuses plans that are quoted after the audit", async () => {
    expect(await backend.startCheckout(ada, { planId: "custom", billingPeriod: "monthly" })).toEqual({
      ok: false,
      error: "INVALID_SELECTION",
    });
  });

  it("starts the subscription after paying, and records the payment", async () => {
    const result = await subscribe(ada, "growth", "monthly");

    expect(result).toMatchObject({
      ok: true,
      value: { planId: "growth", status: "active", currentPeriodEnd: "2026-12-08", serviceIds: [], changesLeftThisMonth: 1 },
    });
    expect(await backend.getPayments(ada)).toMatchObject({
      ok: true,
      value: [{ paidOn: "2026-11-08", amount: 140_000, description: "Growth, monthly, and setup fee" }],
    });
    expect(await backend.hasPaidSetupFee(ada)).toEqual({ ok: true, value: true });
  });

  it("covers 12 months for a 12-month payment", async () => {
    expect(await subscribe(ada, "pro", "twelve-months")).toMatchObject({ value: { currentPeriodEnd: "2027-11-08" } });
  });

  it("can't take a second payment for the same subscription", async () => {
    await subscribe();

    expect(await backend.startCheckout(ada, { planId: "pro", billingPeriod: "monthly" })).toEqual({
      ok: false,
      error: "ALREADY_SUBSCRIBED",
    });
  });

  it("refuses an unknown payment reference", async () => {
    expect(await backend.confirmCheckout(ada, "nonsense")).toEqual({ ok: false, error: "PAYMENT_NOT_FOUND" });
  });

  it("keeps each client's subscription separate", async () => {
    await subscribe(ada);

    expect(await backend.getSubscription(bola)).toEqual({ ok: true, value: null });
  });

  it("lets a client choose services free, then counts swaps", async () => {
    await subscribe();

    expect(await backend.updateServices(ada, ["lead-follow-up", "daily-brief", "payment-reminders", "whatsapp-sales-agent"])).toMatchObject({
      ok: true,
      value: { changesLeftThisMonth: 1 },
    });
    expect(await backend.updateServices(ada, ["lead-follow-up", "daily-brief", "brand-deal-inbox", "whatsapp-sales-agent"])).toMatchObject({
      ok: true,
      value: { changesLeftThisMonth: 0 },
    });
    expect(await backend.updateServices(ada, ["lead-follow-up", "daily-brief", "payment-reminders", "whatsapp-sales-agent"])).toEqual({
      ok: false,
      error: "NO_CHANGES_LEFT",
    });
  });

  it("refuses services outside the plan, or the catch-all task", async () => {
    await subscribe(ada, "growth");

    expect(await backend.updateServices(ada, ["document-reader"])).toEqual({ ok: false, error: "INVALID_SELECTION" });
    expect(await backend.updateServices(ada, ["audit-task"])).toEqual({ ok: false, error: "INVALID_SELECTION" });
  });

  it("schedules a plan change for the next renewal, and can undo it", async () => {
    await subscribe();

    expect(await backend.changePlan(ada, "pro")).toMatchObject({ ok: true, value: { planId: "growth", pendingPlanId: "pro" } });
    expect(await backend.changePlan(ada, "growth")).toMatchObject({ ok: true, value: { pendingPlanId: undefined } });
  });

  it("cancels, keeping the paid period, and can be resumed", async () => {
    await subscribe();
    await backend.changePlan(ada, "pro");

    expect(await backend.cancelSubscription(ada)).toMatchObject({
      ok: true,
      value: { status: "cancelled", currentPeriodEnd: "2026-12-08", pendingPlanId: undefined },
    });
    expect(await backend.updateServices(ada, [])).toEqual({ ok: false, error: "NOT_SUBSCRIBED" });
    expect(await backend.resumeSubscription(ada)).toMatchObject({ ok: true, value: { status: "active" } });
  });

  it("refuses subscription changes for clients without a plan", async () => {
    expect(await backend.cancelSubscription(ada)).toEqual({ ok: false, error: "NOT_SUBSCRIBED" });
    expect(await backend.changePlan(ada, "pro")).toEqual({ ok: false, error: "NOT_SUBSCRIBED" });
  });
});
