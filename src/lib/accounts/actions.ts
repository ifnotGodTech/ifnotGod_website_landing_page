"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createRateLimiter } from "@/lib/rateLimit";
import { ACCOUNTS_ENABLED } from "@/shared/features";
import { logInSchema, parseForm, resetPasswordSchema, signUpSchema } from "@/shared/validators/account";
import type { AccountErrorCode, AccountResult } from "@/types/account";
import type { AuthFormState } from "./formState";
import { getAccountsBackend } from "./index";
import { accountErrorMessage } from "./messages";
import { safeNextPath } from "./paths";
import { endSession, startSession } from "./session";

// Form actions can be called directly with a POST, so each one checks everything itself.

// Per server instance, like the contact form's limiter. The backend adds its own lockout.
const limiter = createRateLimiter({ windowMs: 10 * 60 * 1000, maxRequests: 10, maxTrackedKeys: 10_000 });

async function isRateLimited(): Promise<boolean> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return limiter.isLimited(ip);
}

const text = (form: FormData, name: string) => String(form.get(name) ?? "");

function failed(values: Record<string, string>, error: AccountErrorCode): AuthFormState {
  return { status: "error", fieldErrors: {}, formError: accountErrorMessage(error), values };
}

async function callBackend<T>(call: () => Promise<AccountResult<T>>): Promise<AccountResult<T>> {
  try {
    return await call();
  } catch (error) {
    console.error("[accounts] backend call failed", error);
    return { ok: false, error: "UNAVAILABLE" };
  }
}

export async function logInAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const values = { email: text(form, "email") };
  if (!ACCOUNTS_ENABLED) return failed(values, "UNAVAILABLE");

  const parsed = parseForm(logInSchema, { email: values.email, password: text(form, "password") });
  if (!parsed.success) return { status: "error", fieldErrors: parsed.errors, formError: null, values };
  if (await isRateLimited()) return failed(values, "TOO_MANY_ATTEMPTS");

  const result = await callBackend(() => getAccountsBackend().logIn(parsed.data));
  if (!result.ok) return failed(values, result.error);

  await startSession(result.value);
  redirect(safeNextPath(form.get("next")));
}

export async function signUpAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const values = { fullName: text(form, "fullName"), businessName: text(form, "businessName"), email: text(form, "email") };
  if (!ACCOUNTS_ENABLED) return failed(values, "UNAVAILABLE");

  const parsed = parseForm(signUpSchema, { ...values, password: text(form, "password") });
  if (!parsed.success) return { status: "error", fieldErrors: parsed.errors, formError: null, values };
  if (await isRateLimited()) return failed(values, "TOO_MANY_ATTEMPTS");

  const result = await callBackend(() => getAccountsBackend().signUp(parsed.data));
  if (!result.ok) return failed(values, result.error);

  await startSession(result.value);
  redirect(safeNextPath(form.get("next")));
}

export async function resetPasswordAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const values = { email: text(form, "email") };
  if (!ACCOUNTS_ENABLED) return failed(values, "UNAVAILABLE");

  const parsed = parseForm(resetPasswordSchema, values);
  if (!parsed.success) return { status: "error", fieldErrors: parsed.errors, formError: null, values };
  if (await isRateLimited()) return failed(values, "TOO_MANY_ATTEMPTS");

  // The same answer whether or not the account exists, so the form can't be used to find accounts.
  const result = await callBackend(() => getAccountsBackend().requestPasswordReset(parsed.data.email));
  if (!result.ok) return failed(values, result.error);
  return { status: "success", fieldErrors: {}, formError: null, values };
}

export async function logOutAction(): Promise<void> {
  await endSession();
  redirect("/");
}
