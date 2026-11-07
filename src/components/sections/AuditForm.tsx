"use client";

import { useState, type SubmitEvent } from "react";
import Link from "next/link";
import { submitContactForm } from "@/lib/contact/client";
import { cn } from "@/shared/cn";
import { HONEYPOT_FIELD } from "@/shared/constants";
import { parseContactSubmission, type ContactFieldErrors } from "@/shared/validators/contact";
import type { PlanId } from "@/types/catalogue";

type Status = "idle" | "submitting" | "success" | "error";

export type AuditPlanOption = { id: PlanId; name: string };

type AuditFormProps = {
  plans: AuditPlanOption[];
  defaultPlan?: PlanId;
};

const FORM_TITLE_ID = "audit-form-title";

function focusFirstInvalidField(form: HTMLFormElement, errors: ContactFieldErrors) {
  const fields = form.querySelectorAll<HTMLElement & { name: string }>("input, textarea, select");
  const firstInvalid = Array.from(fields).find((field) => field.name in errors);
  firstInvalid?.focus();
}

export function AuditForm({ plans, defaultPlan }: AuditFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      organisation: String(formData.get("organisation") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      challenge: String(formData.get("challenge") ?? ""),
      plan: String(formData.get("plan") ?? ""),
    };

    const parsed = parseContactSubmission(payload);
    if (!parsed.success) {
      setFieldErrors(parsed.errors);
      setFormError(null);
      setStatus("error");
      focusFirstInvalidField(form, parsed.errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setStatus("submitting");

    const result = await submitContactForm(parsed.data, String(formData.get(HONEYPOT_FIELD) ?? ""));

    if (!result.ok) {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors);
      setStatus("error");
      focusFirstInvalidField(form, result.fieldErrors);
      return;
    }

    setStatus("success");
    form.reset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby={FORM_TITLE_ID}
      noValidate
      className="surface-light relative flex flex-col gap-4.5 rounded-[14px] p-6 sm:p-9"
    >
      <h2 id={FORM_TITLE_ID} className="text-[1.6rem] font-extrabold tracking-[-0.015em]">
        Book your free audit
      </h2>

      <div aria-hidden className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
        <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Two columns only while the form has the full width; beside the intro, labels would wrap unevenly. */}
      <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-1">
        <Field id="fullName" label="Full name" autoComplete="name" required error={fieldErrors.fullName} />
        <Field
          id="organisation"
          label="Business or brand name (optional)"
          autoComplete="organization"
          error={fieldErrors.organisation}
        />
        <Field id="email" label="Email" type="email" autoComplete="email" required error={fieldErrors.email} />
        <Field id="phone" label="Phone or WhatsApp (optional)" type="tel" autoComplete="tel" error={fieldErrors.phone} />
      </div>
      <Field
        id="challenge"
        label="What task or problem is wasting your time?"
        textarea
        required
        error={fieldErrors.challenge}
      />
      <Field id="plan" label="Interested in a plan? (optional)" error={fieldErrors.plan}>
        {(props) => (
          <select {...props} defaultValue={defaultPlan ?? ""}>
            <option value="">Not sure yet</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        )}
      </Field>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="min-h-12.5 cursor-pointer rounded-md bg-maroon px-6 font-bold text-paper transition-colors hover:bg-maroon-bright disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Book my free audit"}
      </button>

      <p className="min-h-5 font-semibold text-maroon" role="status" aria-live="polite">
        {status === "success" && "Thanks, we've got your request. We'll contact you soon to arrange your audit."}
        {status === "error" && (formError ?? "Please check the highlighted fields and try again.")}
      </p>

      <p className="text-[0.88rem] text-on-light-dim">
        You don&apos;t need to know what technology you need. Just tell us the problem. We use your details to arrange
        your audit and respond to you. See our{" "}
        <Link href="/privacy-policy" className="text-maroon underline hover:text-maroon-bright">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}

type ControlProps = {
  id: string;
  name: string;
  required?: boolean;
  autoComplete?: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  className: string;
};

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  textarea?: boolean;
  error?: string;
  children?: (props: ControlProps) => React.ReactNode;
};

function Field({ id, label, type = "text", autoComplete, required, textarea, error, children }: FieldProps) {
  const errorId = `${id}-error`;
  // text-base (16px) stops iOS Safari zooming in when a field is focused.
  // The scroll margin keeps a focused field clear of the fixed nav.
  const props: ControlProps = {
    id,
    name: id,
    required,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: cn(
      "min-h-11.5 w-full scroll-mt-28 rounded-md border bg-white px-3 py-2.5 font-body text-base text-on-light",
      error ? "border-2 border-maroon" : "border-on-light-dim/70"
    ),
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.94rem] font-semibold">
        {label}
      </label>
      {children ? (
        children(props)
      ) : textarea ? (
        <textarea {...props} rows={5} className={cn(props.className, "resize-y")} />
      ) : (
        <input {...props} type={type} />
      )}
      {error && (
        <span id={errorId} className="text-[0.88rem] font-semibold text-maroon">
          {error}
        </span>
      )}
    </div>
  );
}
