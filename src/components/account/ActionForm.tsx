"use client";

import { useActionState, type ReactNode } from "react";
import type { SubscriptionFormState } from "@/lib/accounts/subscriptionActions";
import { cn } from "@/shared/cn";
import { OUTLINE_BUTTON, PRIMARY_BUTTON } from "./buttonStyles";

type ActionFormProps = {
  action: (state: SubscriptionFormState, form: FormData) => Promise<SubscriptionFormState>;
  label: string;
  submitLabel: string;
  pendingLabel: string;
  variant?: "primary" | "outline";
  className?: string;
  children?: ReactNode;
};


/** A form that runs one account action, with a pending state and the backend's message. */
export function ActionForm({ action, label, submitLabel, pendingLabel, variant = "primary", className, children }: ActionFormProps) {
  const [state, formAction, pending] = useActionState(action, { formError: null });

  return (
    <form action={formAction} aria-label={label} className={cn("flex flex-col gap-4", className)}>
      {children}
      <div>
        <button type="submit" disabled={pending} className={variant === "primary" ? PRIMARY_BUTTON : OUTLINE_BUTTON}>
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
      <p role="status" aria-live="polite" className="font-semibold text-maroon empty:hidden">
        {state.formError}
      </p>
    </form>
  );
}
