"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createRateLimiter } from "@/lib/rateLimit";
import { ACCOUNTS_ENABLED } from "@/shared/features";
import { logInSchema, parseForm, resetPasswordSchema, setPasswordSchema, signUpSchema } from "@/shared/validators/account";
import type { AccountErrorCode, AccountResult } from "@/types/account";
import * as api from "./api";
import type { AuthFormState } from "./formState";
import { accountErrorMessage } from "./messages";
import { ACCOUNT_HOME, safeNextPath } from "./paths";
import { endSession, readSession, startSession } from "./session";

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

  const result = await callBackend(() => api.logIn(parsed.data));
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

  const result = await callBackend(() => api.signUp(parsed.data));
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
  const result = await callBackend(() => api.requestPasswordReset(parsed.data.email));
  if (!result.ok) return failed(values, result.error);
  return { status: "success", fieldErrors: {}, formError: null, values };
}

/** "Set a new password", from the reset email's link. Signs the client in on success. */
export async function setNewPasswordAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const values = {};
  if (!ACCOUNTS_ENABLED) return failed(values, "UNAVAILABLE");

  const parsed = parseForm(setPasswordSchema, { uid: text(form, "uid"), token: text(form, "token"), password: text(form, "password") });
  if (!parsed.success) {
    // The link's own parts are hidden fields, so a problem there means the link itself is broken.
    if (parsed.errors.uid || parsed.errors.token) return failed(values, "RESET_LINK_INVALID");
    return { status: "error", fieldErrors: parsed.errors, formError: null, values };
  }
  if (await isRateLimited()) return failed(values, "TOO_MANY_ATTEMPTS");

  const result = await callBackend(() => api.setNewPassword(parsed.data));
  if (!result.ok) return failed(values, result.error);

  await startSession(result.value);
  redirect(ACCOUNT_HOME);
}

export async function logOutAction(): Promise<void> {
  const session = await readSession();
  if (session) {
    // Revoking the token ends the session everywhere, including any copy of this cookie.
    const result = await api.logOut(session.token);
    if (!result.ok && result.error.code !== "UNAUTHENTICATED") {
      console.error("[accounts] log out couldn't reach the backend; the token ends after 7 days without use");
    }
  }
  await endSession();
  redirect("/");
}
