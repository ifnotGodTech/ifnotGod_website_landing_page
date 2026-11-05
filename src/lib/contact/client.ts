import { HONEYPOT_FIELD } from "@/shared/constants";
import type { ContactFieldErrors } from "@/shared/validators/contact";
import type { ContactSubmission } from "@/types/contact";

export type ContactSubmitResult =
  | { ok: true }
  | { ok: false; message: string | null; fieldErrors: ContactFieldErrors };

const DELIVERY_FAILED = "Something went wrong sending your message. Please try again or reach us on WhatsApp.";
const CONNECTION_FAILED =
  "Something went wrong sending your message. Please check your connection and try again, or reach us on WhatsApp.";

export async function submitContactForm(
  submission: ContactSubmission,
  honeypot: string
): Promise<ContactSubmitResult> {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...submission, [HONEYPOT_FIELD]: honeypot }),
    });
    const result = await response.json();

    if (response.ok && result.ok) return { ok: true };

    const fieldErrors: ContactFieldErrors = result.errors ?? {};
    return {
      ok: false,
      fieldErrors,
      message: result.error ?? (result.errors ? null : DELIVERY_FAILED),
    };
  } catch {
    return { ok: false, fieldErrors: {}, message: CONNECTION_FAILED };
  }
}
