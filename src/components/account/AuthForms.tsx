"use client";

import { useActionState, type ReactNode } from "react";
import Link from "next/link";
import { FormField } from "@/components/ui/FormField";
import { INITIAL_AUTH_STATE, type AuthFormState } from "@/lib/accounts/formState";
import { MIN_PASSWORD_LENGTH } from "@/shared/validators/account";
import { GoogleButton } from "./GoogleButton";

type AuthAction = (state: AuthFormState, form: FormData) => Promise<AuthFormState>;

const CARD = "surface-light flex flex-col gap-4.5 rounded-[14px] p-6 sm:p-8";
const SUBMIT =
  "min-h-12.5 cursor-pointer rounded-md bg-maroon px-6 font-bold text-paper transition-colors hover:bg-maroon-bright disabled:cursor-not-allowed disabled:opacity-60";

function FormMessage({ state }: { state: AuthFormState }) {
  return (
    <p role="status" aria-live="polite" className="min-h-5 font-semibold text-maroon empty:hidden">
      {state.formError ?? (state.status === "error" ? "Please check the highlighted fields and try again." : "")}
    </p>
  );
}

function AuthForm({ label, action, children }: { label: string; action: (form: FormData) => void; children: ReactNode }) {
  return (
    <form action={action} aria-label={label} noValidate className={CARD}>
      {children}
    </form>
  );
}

/** `notice` explains why they're back here, such as Google sign-in not working. */
export function LogInForm({ action, next, notice = null }: { action: AuthAction; next: string; notice?: string | null }) {
  const [state, formAction, pending] = useActionState(action, INITIAL_AUTH_STATE);

  return (
    <AuthForm label="Log in" action={formAction}>
      {notice && state.status === "idle" && (
        <p role="alert" className="font-semibold text-maroon">
          {notice}
        </p>
      )}
      <GoogleButton label="Continue with Google" next={next} />
      <input type="hidden" name="next" value={next} />
      <FormField id="email" label="Email" type="email" autoComplete="email" required error={state.fieldErrors.email} defaultValue={state.values.email} />
      <div className="flex flex-col gap-1.5">
        <FormField id="password" label="Password" type="password" autoComplete="current-password" required error={state.fieldErrors.password} />
        <Link href="/reset-password" className="w-fit text-[0.88rem] font-semibold text-maroon underline hover:text-maroon-bright">
          Forgot password?
        </Link>
      </div>
      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? "Logging in…" : "Log in"}
      </button>
      <FormMessage state={state} />
    </AuthForm>
  );
}

export function SignUpForm({ action, next }: { action: AuthAction; next: string }) {
  const [state, formAction, pending] = useActionState(action, INITIAL_AUTH_STATE);

  return (
    <AuthForm label="Create your account" action={formAction}>
      <GoogleButton label="Sign up with Google" next={next} />
      <input type="hidden" name="next" value={next} />
      <FormField id="fullName" label="Full name" autoComplete="name" required error={state.fieldErrors.fullName} defaultValue={state.values.fullName} />
      <FormField
        id="businessName"
        label="Business or brand name (optional)"
        autoComplete="organization"
        error={state.fieldErrors.businessName}
        defaultValue={state.values.businessName}
      />
      <FormField id="email" label="Email" type="email" autoComplete="email" required error={state.fieldErrors.email} defaultValue={state.values.email} />
      <div className="flex flex-col gap-1.5">
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          error={state.fieldErrors.password}
          describedBy="password-hint"
        />
        <span id="password-hint" className="text-[0.88rem] text-on-light-dim">
          At least {MIN_PASSWORD_LENGTH} characters.
        </span>
      </div>
      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? "Creating your account…" : "Create account"}
      </button>
      <FormMessage state={state} />
      <p className="text-[0.88rem] text-on-light-dim">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-maroon underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="text-maroon underline">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthForm>
  );
}

export function ResetPasswordForm({ action }: { action: AuthAction }) {
  const [state, formAction, pending] = useActionState(action, INITIAL_AUTH_STATE);

  if (state.status === "success") {
    return (
      <div role="status" className={CARD}>
        <h2 className="text-[1.6rem] font-extrabold tracking-[-0.02em]">Check your email</h2>
        <p className="text-on-light-dim">
          If there&apos;s an account for {state.values.email}, we&apos;ve sent a link to reset your password.
        </p>
        <a href="/reset-password" className="w-fit font-semibold text-maroon underline hover:text-maroon-bright">
          Use a different email
        </a>
      </div>
    );
  }

  return (
    <AuthForm label="Reset your password" action={formAction}>
      <FormField id="email" label="Email" type="email" autoComplete="email" required error={state.fieldErrors.email} defaultValue={state.values.email} />
      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <FormMessage state={state} />
    </AuthForm>
  );
}

/** "Set a new password", opened from the reset email's link. The link's parts travel as hidden fields. */
export function SetPasswordForm({ action, uid, token }: { action: AuthAction; uid: string; token: string }) {
  const [state, formAction, pending] = useActionState(action, INITIAL_AUTH_STATE);

  return (
    <AuthForm label="Set a new password" action={formAction}>
      <input type="hidden" name="uid" value={uid} />
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-1.5">
        <FormField
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          error={state.fieldErrors.password}
          describedBy="new-password-hint"
        />
        <span id="new-password-hint" className="text-[0.88rem] text-on-light-dim">
          At least {MIN_PASSWORD_LENGTH} characters. You&apos;ll be logged out everywhere else.
        </span>
      </div>
      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? "Saving…" : "Save and log in"}
      </button>
      <FormMessage state={state} />
    </AuthForm>
  );
}
