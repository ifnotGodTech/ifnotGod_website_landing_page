import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  enabled: true,
  user: null as null | { id: string; fullName: string; email: string; signInMethod: "password" },
  backend: null as unknown,
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
vi.mock("./index", () => ({
  getAccountsBackend: () => mocks.backend,
  readAccountSession: async () => (mocks.user ? { status: "active", user: mocks.user, token: "t0ken" } : { status: "none" }),
}));

import { createStubBackend } from "./stub";
import { memoryStubStore } from "./stubStore";
import {
  cancelSubscriptionAction,
  changePlanAction,
  confirmStubPaymentAction,
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

describe("subscription actions", () => {
  beforeEach(() => {
    mocks.enabled = true;
    mocks.user = { id: "ada", fullName: "Ada Obi", email: "ada@example.com", signInMethod: "password" };
    mocks.backend = createStubBackend(memoryStubStore(), () => "2026-11-08");
  });

  async function subscribe() {
    const payAt = await redirectedTo(startSubscriptionAction(initial, form({ plan: "growth", period: "monthly" })));
    const ref = new URL(payAt!, "http://x").searchParams.get("ref")!;
    return redirectedTo(confirmStubPaymentAction(initial, form({ ref })));
  }

  it("sends signed-out visitors to log in", async () => {
    mocks.user = null;

    expect(await redirectedTo(startSubscriptionAction(initial, form({ plan: "growth", period: "monthly" })))).toBe(
      "/login?next=%2Faccount%2Fsubscribe"
    );
  });

  it("does nothing while accounts are switched off", async () => {
    mocks.enabled = false;

    expect(await redirectedTo(startSubscriptionAction(initial, form({ plan: "growth", period: "monthly" })))).toBe("/");
  });

  it("refuses a plan or period that doesn't exist", async () => {
    expect(await startSubscriptionAction(initial, form({ plan: "platinum", period: "monthly" }))).toEqual({
      formError: expect.stringMatching(/isn't part of your plan/),
    });
  });

  it("goes from paying to choosing services", async () => {
    expect(await subscribe()).toBe("/account/services?welcome=1");
  });

  it("saves services and returns to the account", async () => {
    await subscribe();

    expect(await redirectedTo(updateServicesAction(initial, form({ service: ["lead-follow-up"] })))).toBe("/account?updated=services");
  });

  it("explains a services choice the plan doesn't allow", async () => {
    await subscribe();

    expect(await updateServicesAction(initial, form({ service: ["document-reader"] }))).toEqual({
      formError: expect.stringMatching(/isn't part of your plan/),
    });
  });

  it("schedules a plan change", async () => {
    await subscribe();

    expect(await redirectedTo(changePlanAction(initial, form({ plan: "pro" })))).toBe("/account?updated=plan");
  });

  it("cancels, then keeps the plan", async () => {
    await subscribe();

    expect(await redirectedTo(cancelSubscriptionAction(initial, form({ reason: "It costs too much" })))).toBe("/account?updated=cancelled");
    expect(await redirectedTo(resumeSubscriptionAction())).toBe("/account?updated=resumed");
  });

  it("explains cancelling without a plan", async () => {
    expect(await cancelSubscriptionAction(initial, form({}))).toEqual({ formError: expect.stringMatching(/don't have an active plan/) });
  });
});
