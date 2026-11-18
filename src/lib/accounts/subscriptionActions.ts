"use server";

import { redirect } from "next/navigation";
import { ACCOUNTS_ENABLED } from "@/shared/features";
import type { AccountErrorCode, AccountResult } from "@/types/account";
import type { PlanId } from "@/types/catalogue";
import { isBillingPeriod } from "./billing";
import { readAccountSession } from "./index";
import { accountErrorMessage } from "./messages";
import * as subscriptions from "./subscriptions";

// Form actions can be called directly with a POST, so each one checks the session itself.

export type SubscriptionFormState = { formError: string | null };

const failed = (error: AccountErrorCode): SubscriptionFormState => ({ formError: accountErrorMessage(error) });

/** The signed-in client's token, confirmed with the backend. */
async function signedInToken(returnTo: string): Promise<string> {
  if (!ACCOUNTS_ENABLED) redirect("/");
  const session = await readAccountSession();
  if (session.status === "unavailable") throw new Error("Accounts aren't available right now.");
  if (session.status !== "active") redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return session.token;
}

async function callBackend<T>(call: () => Promise<AccountResult<T>>): Promise<AccountResult<T>> {
  try {
    return await call();
  } catch (error) {
    console.error("[accounts] backend call failed", error);
    return { ok: false, error: "UNAVAILABLE" };
  }
}

const isPlanId = (value: unknown): value is PlanId => ["starter", "growth", "pro", "custom"].includes(String(value));

export async function startSubscriptionAction(_: SubscriptionFormState, form: FormData): Promise<SubscriptionFormState> {
  const token = await signedInToken("/account/subscribe");
  const planId = form.get("plan");
  const billingPeriod = form.get("period");
  if (!isPlanId(planId) || !isBillingPeriod(billingPeriod)) return failed("INVALID_SELECTION");

  const result = await callBackend(() => subscriptions.startCheckout(token, { planId, billingPeriod }));
  if (!result.ok) return failed(result.error);
  redirect(result.value.redirectTo);
}

export async function changePlanAction(_: SubscriptionFormState, form: FormData): Promise<SubscriptionFormState> {
  const token = await signedInToken("/account/subscribe");
  const planId = form.get("plan");
  if (!isPlanId(planId)) return failed("INVALID_SELECTION");

  const result = await callBackend(() => subscriptions.changePlan(token, planId));
  if (!result.ok) return failed(result.error);
  redirect("/account?updated=plan");
}

export async function updateServicesAction(_: SubscriptionFormState, form: FormData): Promise<SubscriptionFormState> {
  const token = await signedInToken("/account/services");
  const serviceIds = form.getAll("service").map(String);

  const result = await callBackend(() => subscriptions.updateServices(token, serviceIds));
  if (!result.ok) return failed(result.error);
  redirect("/account?updated=services");
}

export async function cancelSubscriptionAction(_: SubscriptionFormState, form: FormData): Promise<SubscriptionFormState> {
  const token = await signedInToken("/account/cancel");
  const reason = String(form.get("reason") ?? "") || undefined;

  const result = await callBackend(() => subscriptions.cancelSubscription(token, reason));
  if (!result.ok) return failed(result.error);
  redirect("/account?updated=cancelled");
}

export async function resumeSubscriptionAction(): Promise<SubscriptionFormState> {
  const token = await signedInToken("/account");

  const result = await callBackend(() => subscriptions.resumeSubscription(token));
  if (!result.ok) return failed(result.error);
  redirect("/account?updated=resumed");
}
