import { z } from "zod";
import { apiRequest } from "@/lib/api/http";
import type { AccountResult, BillingPeriod, Checkout, Payment, Subscription } from "@/types/account";
import type { PlanId } from "@/types/catalogue";
import { accountErrorFor } from "./api";

// The signed-in client's subscription and payments, through the backend's /account/subscription/
// endpoints. Each call carries the client's token from the session cookie.

const PLAN_IDS = ["starter", "growth", "pro", "custom"] as const satisfies readonly PlanId[];
const PERIODS = ["monthly", "six-months", "twelve-months"] as const satisfies readonly BillingPeriod[];

const subscriptionSchema: z.ZodType<Subscription> = z.object({
  planId: z.enum(PLAN_IDS),
  billingPeriod: z.enum(PERIODS),
  status: z.enum(["active", "cancelled", "ended"]),
  currentPeriodEnd: z.string(),
  serviceIds: z.array(z.string()),
  changesLeftThisMonth: z.number().int(),
  pendingPlanId: z
    .enum(PLAN_IDS)
    .nullable()
    .transform((value) => value ?? undefined),
  paymentDue: z
    .object({ amount: z.number().nullable(), workingUntil: z.string(), payUrl: z.string().url().nullable() })
    .nullable()
    .transform((value) => value ?? undefined),
});
const confirmedSchema = z.object({ subscription: subscriptionSchema, renewal: z.boolean() });
const accountSubscriptionSchema = z.object({ subscription: subscriptionSchema.nullable(), setupFeePaid: z.boolean() });
const paymentSchema: z.ZodType<Payment> = z.object({ id: z.string(), paidOn: z.string(), description: z.string(), amount: z.number() });
const paymentPageSchema = z.object({ items: z.array(paymentSchema) });
const checkoutSchema = z.object({ redirectTo: z.string().url() });

const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

async function call<T>(path: string, token: string, options: { method?: "GET" | "POST" | "PUT"; body?: unknown; schema: z.ZodType<T> }) {
  const result = await apiRequest(path, { ...options, headers: bearer(token) });
  return result.ok ? ({ ok: true, value: result.data } as const) : ({ ok: false, error: accountErrorFor(result.error) } as const);
}

export function getAccountSubscription(token: string): Promise<AccountResult<{ subscription: Subscription | null; setupFeePaid: boolean }>> {
  return call("/account/subscription/", token, { schema: accountSubscriptionSchema });
}

/** The latest payments, newest first. */
export async function getPayments(token: string): Promise<AccountResult<Payment[]>> {
  const result = await call("/account/payments/?pageSize=50", token, { schema: paymentPageSchema });
  return result.ok ? { ok: true, value: result.value.items } : result;
}

/** Flutterwave's payment page for this plan and period. The backend works out the amount. */
export function startCheckout(token: string, checkout: Checkout): Promise<AccountResult<{ redirectTo: string }>> {
  return call("/account/subscription/checkout/", token, { method: "POST", body: checkout, schema: checkoutSchema });
}

/** After Flutterwave sends the client back: the backend checks the payment, then starts or renews the plan. */
export function confirmPayment(
  token: string,
  reference: string,
  transactionId: number | null
): Promise<AccountResult<{ subscription: Subscription; renewal: boolean }>> {
  return call("/account/subscription/confirm/", token, { method: "POST", body: { reference, transactionId }, schema: confirmedSchema });
}

export function updateServices(token: string, serviceIds: string[]): Promise<AccountResult<Subscription>> {
  return call("/account/subscription/services/", token, { method: "PUT", body: { serviceIds }, schema: subscriptionSchema });
}

/** Switches plan at the next renewal. */
export function changePlan(token: string, planId: PlanId): Promise<AccountResult<Subscription>> {
  return call("/account/subscription/plan/", token, { method: "POST", body: { planId }, schema: subscriptionSchema });
}

export function cancelSubscription(token: string, reason?: string): Promise<AccountResult<Subscription>> {
  return call("/account/subscription/cancel/", token, { method: "POST", body: { reason: reason ?? "" }, schema: subscriptionSchema });
}

/** Undoes a cancellation while the paid period is still running. */
export function resumeSubscription(token: string): Promise<AccountResult<Subscription>> {
  return call("/account/subscription/keep/", token, { method: "POST", schema: subscriptionSchema });
}
