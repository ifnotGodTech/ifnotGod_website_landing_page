"use client";

import { useState, type FormEvent } from "react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { cn } from "@/shared/cn";
import { CONTACT_INFO } from "@/shared/constants";
import { contactSubmissionSchema, type ContactFieldErrors } from "@/shared/validators/contact";

type Status = "idle" | "submitting" | "success" | "error";

function focusFirstInvalidField(form: HTMLFormElement, errors: ContactFieldErrors) {
  const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
  const firstInvalid = Array.from(fields).find((field) => field.name in errors);
  firstInvalid?.focus();
}

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      organisation: String(formData.get("organisation") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      challenge: String(formData.get("challenge") ?? ""),
      desiredOutcome: String(formData.get("desiredOutcome") ?? ""),
    };

    const parsed = contactSubmissionSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: ContactFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof ContactFieldErrors;
        if (field && !errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      setFormError(null);
      setStatus("error");
      focusFirstInvalidField(form, errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        const serverFieldErrors: ContactFieldErrors = result.errors ?? {};
        setFormError(
          result.error ??
            (result.errors ? null : "Something went wrong sending your message. Please try again.")
        );
        setFieldErrors(serverFieldErrors);
        setStatus("error");
        focusFirstInvalidField(form, serverFieldErrors);
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setFormError("Something went wrong sending your message. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="py-16 sm:py-24 lg:py-32">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <RevealOnScroll>
          <div>
            <span className="flex items-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-orange before:content-[''] before:h-px before:w-[18px] before:bg-orange">
              Contact
            </span>
            <h2 className="mt-4 text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold">Let&apos;s Solve Something.</h2>
            <p className="mt-4 text-[clamp(1.05rem,1.4vw,1.2rem)] text-paper-dim">
              Tell us what&apos;s slowing your organisation down. We&apos;ll help you explore what technology can
              do about it.
            </p>

            <div className="mt-9 flex flex-col gap-7">
              <div className="flex flex-col gap-1.5 border-t border-line pt-5">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mute">Email</span>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="w-fit break-all font-display text-[1.15rem] transition-colors hover:text-orange"
                >
                  {CONTACT_INFO.email}
                </a>
              </div>
              <div className="flex flex-col gap-1.5 border-t border-line pt-5">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mute">WhatsApp</span>
                <a
                  href={CONTACT_INFO.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex w-fit items-center justify-center gap-2 rounded-[3px] border border-orange px-[18px] py-[10px] text-[0.85rem] font-semibold text-orange transition-colors hover:bg-orange hover:text-ink"
                >
                  Chat on WhatsApp
                </a>
              </div>
              <div className="flex flex-col gap-1.5 border-t border-line pt-5">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mute">Location</span>
                <span className="font-display text-[1.15rem]">{CONTACT_INFO.location}</span>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <form onSubmit={handleSubmit} className="border border-line-strong bg-surface p-7 sm:p-11" noValidate>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                id="fullName"
                name="fullName"
                label="Full Name"
                autoComplete="name"
                required
                error={fieldErrors.fullName}
              />
              <Field
                id="organisation"
                name="organisation"
                label="Organisation / Company (optional)"
                autoComplete="organization"
                error={fieldErrors.organisation}
              />
            </div>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                id="email"
                name="email"
                label="Email Address"
                type="email"
                autoComplete="email"
                required
                error={fieldErrors.email}
              />
              <Field
                id="phone"
                name="phone"
                label="Phone / WhatsApp (optional)"
                type="tel"
                autoComplete="tel"
                error={fieldErrors.phone}
              />
            </div>
            <div className="mt-5">
              <Field
                id="challenge"
                name="challenge"
                label="What challenge are you facing?"
                textarea
                required
                error={fieldErrors.challenge}
              />
            </div>
            <div className="mt-5">
              <Field
                id="desiredOutcome"
                name="desiredOutcome"
                label="What would you like technology to help you achieve? (optional)"
                textarea
                rows={3}
                error={fieldErrors.desiredOutcome}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
              <p className="max-w-[32ch] text-[0.82rem] text-mute">
                You don&apos;t need to know what technology you need. Just tell us the problem.
              </p>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center justify-center gap-2 rounded-[3px] bg-maroon px-[26px] py-[14px] text-sm font-semibold text-paper transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-maroon-bright disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Send My Challenge"}
              </button>
            </div>

            <p className="mt-3.5 min-h-5 font-mono text-[0.78rem]" role="status" aria-live="polite">
              {status === "success" && (
                <span className="text-orange">Thanks — we&apos;ve received your challenge. We&apos;ll be in touch shortly.</span>
              )}
              {status === "error" && formError && <span className="text-orange">{formError}</span>}
              {status === "error" && !formError && (
                <span className="text-orange">Please check the highlighted fields and try again.</span>
              )}
            </p>
          </form>
        </RevealOnScroll>
      </div>
    </section>
  );
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  error?: string;
};

function Field({ id, name, label, type = "text", autoComplete, required, textarea, rows = 5, error }: FieldProps) {
  const errorId = `${id}-error`;
  // text-base (16px) stops iOS Safari zooming in when a field is focused.
  // The scroll margin keeps a focused field clear of the fixed nav.
  const fieldProps = {
    id,
    name,
    required,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: cn(
      "scroll-mt-28 border bg-ink px-3.5 py-3.5 font-body text-base text-paper focus:border-orange focus:outline-none",
      error ? "border-orange" : "border-line-strong"
    ),
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mute">
        {label}
      </label>
      {textarea ? (
        <textarea {...fieldProps} rows={rows} className={cn(fieldProps.className, "resize-y")} />
      ) : (
        <input {...fieldProps} type={type} />
      )}
      {error && (
        <span id={errorId} className="text-[0.78rem] text-orange">
          {error}
        </span>
      )}
    </div>
  );
}
