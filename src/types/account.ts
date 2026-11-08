import type { PlanId } from "@/types/catalogue";

// The contract between this site and the backend's account API. The stand-in in
// src/lib/accounts follows it, so the real API can replace the stand-in without screen changes.

export type SignInMethod = "password" | "google";

export type AccountUser = {
  id: string;
  fullName: string;
  email: string;
  businessName?: string;
  signInMethod: SignInMethod;
};

export type BillingPeriod = "monthly" | "six-months" | "twelve-months";

export type SubscriptionStatus = "active" | "cancelled" | "ended";

export type Subscription = {
  planId: PlanId;
  billingPeriod: BillingPeriod;
  status: SubscriptionStatus;
  /** ISO date. The plan renews on this date, or ends then if cancelled. */
  currentPeriodEnd: string;
  /** Service ids from the catalogue. */
  serviceIds: string[];
  changesLeftThisMonth: number;
  /** A plan change waiting for the next renewal. */
  pendingPlanId?: PlanId;
};

export type Checkout = { planId: PlanId; billingPeriod: BillingPeriod };

export type Payment = {
  id: string;
  /** ISO date. */
  paidOn: string;
  description: string;
  /** In naira. */
  amount: number;
};

export type AccountErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN"
  | "TOO_MANY_ATTEMPTS"
  | "UNAVAILABLE"
  | "NOT_SUBSCRIBED"
  | "ALREADY_SUBSCRIBED"
  | "INVALID_SELECTION"
  | "NO_CHANGES_LEFT"
  | "PAYMENT_NOT_FOUND";

export type AccountResult<T> = { ok: true; value: T } | { ok: false; error: AccountErrorCode };

export type SignUpInput = { fullName: string; businessName?: string; email: string; password: string };

export type LogInInput = { email: string; password: string };
