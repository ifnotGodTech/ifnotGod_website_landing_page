"use server";

import { redirect } from "next/navigation";
import { ACCOUNTS_ENABLED } from "@/shared/features";
import type { AccountErrorCode, AccountResult, AccountUser } from "@/types/account";
import type { PlanId } from "@/types/catalogue";
import { isBillingPeriod } from "./billing";
import { getAccountsBackend, readAccountSession } from "./index";
import { accountErrorMessage } from "./messages";

// Form actions can be called directly with a POST, so each one checks the session itself.

export type SubscriptionFormState = { formError: string | null };

const failed = (error: AccountErrorCode): SubscriptionFormState => ({ formError: accountErrorMessage(error) });

async function signedInUser(returnTo: string): Promise<AccountUser> {
  if (!ACCOUNTS_ENABLED) redirect("/");
  const session = await readAccountSession();
  if (session.status === "unavailable") throw new Error("Accounts aren't available right now.");
  if (session.status !== "active") redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return session.user;
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
  const user = await signedInUser("/account/subscribe");
  const planId = form.get("plan");
  const billingPeriod = form.get("period");
  if (!isPlanId(planId) || !isBillingPeriod(billingPeriod)) return failed("INVALID_SELECTION");

  const result = await callBackend(() => getAccountsBackend().startCheckout(user, { planId, billingPeriod }));
  if (!result.ok) return failed(result.error);
  redirect(result.value.redirectTo);
}

export async function changePlanAction(_: SubscriptionFormState, form: FormData): Promise<SubscriptionFormState> {
  const user = await signedInUser("/account/subscribe");
  const planId = form.get("plan");
  if (!isPlanId(planId)) return failed("INVALID_SELECTION");

  const result = await callBackend(() => getAccountsBackend().changePlan(user, planId));
  if (!result.ok) return failed(result.error);
  redirect("/account?updated=plan");
}

export async function confirmStubPaymentAction(_: SubscriptionFormState, form: FormData): Promise<SubscriptionFormState> {
  const user = await signedInUser("/account");
  const reference = String(form.get("ref") ?? "");

  const result = await callBackend(() => getAccountsBackend().confirmCheckout(user, reference));
  if (!result.ok) return failed(result.error);
  redirect("/account/services?welcome=1");
}

export async function updateServicesAction(_: SubscriptionFormState, form: FormData): Promise<SubscriptionFormState> {
  const user = await signedInUser("/account/services");
  const serviceIds = form.getAll("service").map(String);

  const result = await callBackend(() => getAccountsBackend().updateServices(user, serviceIds));
  if (!result.ok) return failed(result.error);
  redirect("/account?updated=services");
}

export async function cancelSubscriptionAction(_: SubscriptionFormState, form: FormData): Promise<SubscriptionFormState> {
  const user = await signedInUser("/account/cancel");
  const reason = String(form.get("reason") ?? "") || undefined;

  const result = await callBackend(() => getAccountsBackend().cancelSubscription(user, reason));
  if (!result.ok) return failed(result.error);
  redirect("/account?updated=cancelled");
}

export async function resumeSubscriptionAction(): Promise<SubscriptionFormState> {
  const user = await signedInUser("/account");

  const result = await callBackend(() => getAccountsBackend().resumeSubscription(user));
  if (!result.ok) return failed(result.error);
  redirect("/account?updated=resumed");
}
