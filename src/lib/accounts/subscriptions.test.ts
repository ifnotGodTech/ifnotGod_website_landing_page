import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cancelSubscription, confirmPayment, getAccountSubscription, getPayments, startCheckout, updateServices } from "./subscriptions";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const fetchMock = vi.fn();
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const subscription = {
  planId: "growth",
  billingPeriod: "monthly",
  status: "active",
  currentPeriodEnd: "2026-12-10",
  serviceIds: ["lead-follow-up"],
  changesLeftThisMonth: 1,
  pendingPlanId: null,
};
const sent = (n = 0) => {
  const [url, options] = fetchMock.mock.calls[n];
  return { url, method: options.method, headers: options.headers, body: options.body ? JSON.parse(options.body) : undefined };
};

describe("subscription API", () => {
  beforeEach(() => {
    vi.stubEnv("BACKEND_API_URL", "https://api.example.com");
    vi.stubEnv("BACKEND_APP_KEY", "web-key");
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reads the plan and whether the setup fee was paid, with the client's token", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { subscription, setupFeePaid: true }));

    expect(await getAccountSubscription("t0ken")).toEqual({
      ok: true,
      value: { subscription: { ...subscription, pendingPlanId: undefined }, setupFeePaid: true },
    });
    expect(sent()).toMatchObject({ url: "https://api.example.com/api/v1/account/subscription/", headers: { authorization: "Bearer t0ken" } });
  });

  it("reads payments from the first page", async () => {
    const payment = { id: "3", paidOn: "2026-11-10", description: "Growth, monthly, and setup fee", amount: 140000 };
    fetchMock.mockResolvedValueOnce(json(200, { items: [payment], total: 1, page: 1, pageSize: 50 }));

    expect(await getPayments("t0ken")).toEqual({ ok: true, value: [payment] });
    expect(sent().url).toBe("https://api.example.com/api/v1/account/payments/?pageSize=50");
  });

  it("starts checkout and confirms the payment", async () => {
    fetchMock
      .mockResolvedValueOnce(json(201, { redirectTo: "https://checkout.flutterwave.com/v3/hosted/pay/x" }))
      .mockResolvedValueOnce(json(200, subscription));

    expect(await startCheckout("t0ken", { planId: "growth", billingPeriod: "monthly" })).toEqual({
      ok: true,
      value: { redirectTo: "https://checkout.flutterwave.com/v3/hosted/pay/x" },
    });
    expect(await confirmPayment("t0ken", "ifng-1", 777)).toMatchObject({ ok: true, value: { planId: "growth" } });
    expect(sent(1)).toMatchObject({ url: "https://api.example.com/api/v1/account/subscription/confirm/", body: { reference: "ifng-1", transactionId: 777 } });
  });

  it("changes services and cancels", async () => {
    fetchMock.mockImplementation(async () => json(200, subscription));

    await updateServices("t0ken", ["lead-follow-up"]);
    await cancelSubscription("t0ken");

    expect(sent(0)).toMatchObject({ method: "PUT", body: { serviceIds: ["lead-follow-up"] } });
    expect(sent(1)).toMatchObject({ method: "POST", body: { reason: "" } });
  });

  it.each([
    ["NO_CHANGES_LEFT", 409],
    ["NOT_SUBSCRIBED", 409],
    ["ALREADY_SUBSCRIBED", 409],
    ["INVALID_SELECTION", 400],
    ["PAYMENT_NOT_COMPLETED", 409],
    ["PAYMENT_NOT_FOUND", 404],
  ])("passes on %s", async (detailCode, status) => {
    fetchMock.mockResolvedValueOnce(json(status, { code: "CONFLICT", message: "x", errors: {}, detailCode }));

    expect(await updateServices("t0ken", [])).toEqual({ ok: false, error: detailCode });
  });
});
