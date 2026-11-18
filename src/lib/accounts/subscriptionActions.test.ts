import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  enabled: true,
  session: { status: "active", user: { id: "7" }, token: "t0ken" } as Record<string, unknown>,
  api: {
    startCheckout: vi.fn(),
    changePlan: vi.fn(),
    updateServices: vi.fn(),
    cancelSubscription: vi.fn(),
    resumeSubscription: vi.fn(),
  },
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
}));
vi.mock("@/shared/features", () => ({
  get ACCOUNTS_ENABLED() {
    return mocks.enabled;
  },
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("./index", () => ({ readAccountSession: async () => mocks.session }));
vi.mock("./subscriptions", () => mocks.api);

import {
  cancelSubscriptionAction,
  changePlanAction,
  resumeSubscriptionAction,
  startSubscriptionAction,
  updateServicesAction,
} from "./subscriptionActions";

const form = (fields: Record<string, string | string[]>) => {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => [value].flat().forEach((item) => data.append(key, item)));
  return data;
};
const initial = { formError: null };
const redirectedTo = async (run: Promise<unknown>) => {
  const error = await run.then(() => null, (thrown: Error) => thrown);
  return error?.message.replace("REDIRECT ", "") ?? null;
};
const ok = { ok: true, value: {} };

describe("subscription actions", () => {
  beforeEach(() => {
    mocks.enabled = true;
    mocks.session = { status: "active", user: { id: "7" }, token: "t0ken" };
    Object.values(mocks.api).forEach((fn) => fn.mockReset());
    mocks.redirect.mockClear();
  });

  it("sends signed-out visitors to log in, coming back afterwards", async () => {
    mocks.session = { status: "none" };

    expect(await redirectedTo(startSubscriptionAction(initial, form({ plan: "growth", period: "monthly" })))).toBe(
      "/login?next=%2Faccount%2Fsubscribe"
    );
    expect(mocks.api.startCheckout).not.toHaveBeenCalled();
  });

  it("refuses a plan or period that doesn't exist, without asking the backend", async () => {
    const state = await startSubscriptionAction(initial, form({ plan: "gold", period: "monthly" }));

    expect(state.formError).toMatch(/isn't part of your plan/);
    expect(mocks.api.startCheckout).not.toHaveBeenCalled();
  });

  it("sends the client to Flutterwave's payment page for the chosen plan", async () => {
    mocks.api.startCheckout.mockResolvedValueOnce({ ok: true, value: { redirectTo: "https://checkout.flutterwave.com/v3/hosted/pay/x" } });

    expect(await redirectedTo(startSubscriptionAction(initial, form({ plan: "growth", period: "six-months" })))).toBe(
      "https://checkout.flutterwave.com/v3/hosted/pay/x"
    );
    expect(mocks.api.startCheckout).toHaveBeenCalledWith("t0ken", { planId: "growth", billingPeriod: "six-months" });
  });

  it("explains an existing plan instead of charging again", async () => {
    mocks.api.startCheckout.mockResolvedValueOnce({ ok: false, error: "ALREADY_SUBSCRIBED" });

    expect((await startSubscriptionAction(initial, form({ plan: "growth", period: "monthly" }))).formError).toMatch(/already have an active plan/);
  });

  it("saves services and returns to the account", async () => {
    mocks.api.updateServices.mockResolvedValueOnce(ok);

    expect(await redirectedTo(updateServicesAction(initial, form({ service: ["lead-follow-up", "daily-brief"] })))).toBe("/account?updated=services");
    expect(mocks.api.updateServices).toHaveBeenCalledWith("t0ken", ["lead-follow-up", "daily-brief"]);
  });

  it("explains a swap with no changes left", async () => {
    mocks.api.updateServices.mockResolvedValueOnce({ ok: false, error: "NO_CHANGES_LEFT" });

    expect((await updateServicesAction(initial, form({ service: ["daily-brief"] }))).formError).toMatch(/used this month's changes/);
  });

  it("schedules a plan change", async () => {
    mocks.api.changePlan.mockResolvedValueOnce(ok);

    expect(await redirectedTo(changePlanAction(initial, form({ plan: "pro" })))).toBe("/account?updated=plan");
    expect(mocks.api.changePlan).toHaveBeenCalledWith("t0ken", "pro");
  });

  it("cancels with the reason given, then keeps the plan", async () => {
    mocks.api.cancelSubscription.mockResolvedValueOnce(ok);
    mocks.api.resumeSubscription.mockResolvedValueOnce(ok);

    expect(await redirectedTo(cancelSubscriptionAction(initial, form({ reason: "It costs too much" })))).toBe("/account?updated=cancelled");
    expect(mocks.api.cancelSubscription).toHaveBeenCalledWith("t0ken", "It costs too much");
    expect(await redirectedTo(resumeSubscriptionAction())).toBe("/account?updated=resumed");
  });

  it("explains cancelling without a plan", async () => {
    mocks.api.cancelSubscription.mockResolvedValueOnce({ ok: false, error: "NOT_SUBSCRIBED" });

    expect((await cancelSubscriptionAction(initial, form({}))).formError).toMatch(/don't have an active plan/);
  });

  it("does nothing while accounts are switched off", async () => {
    mocks.enabled = false;

    expect(await redirectedTo(cancelSubscriptionAction(initial, form({})))).toBe("/");
  });
});
