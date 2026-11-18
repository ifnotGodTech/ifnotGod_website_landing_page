import { z } from "zod";
import { apiRequest } from "@/lib/api/http";
import type { ContactFieldErrors, ContactSubmissionInput } from "@/shared/validators/contact";

// Sends an audit request to the backend, which saves it, then emails the team. A failed email never
// loses it: the backend retries, and the team also sees it in the dashboard under Leads.

export type LeadResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; errors: ContactFieldErrors }
  | { ok: false; reason: "rate-limited" | "unavailable" };

const received = z.object({ received: z.literal(true) });

export async function sendLeadToBackend(submission: ContactSubmissionInput): Promise<LeadResult> {
  const result = await apiRequest("/leads/", {
    method: "POST",
    body: {
      fullName: submission.fullName,
      organisation: submission.organisation ?? "",
      email: submission.email,
      phone: submission.phone ?? "",
      challenge: submission.challenge,
      plan: submission.plan ?? null,
    },
    schema: received,
  });
  if (result.ok) return { ok: true };
  if (result.error.code === "VALIDATION") return { ok: false, reason: "invalid", errors: result.error.fieldErrors as ContactFieldErrors };
  if (result.error.code === "RATE_LIMITED") return { ok: false, reason: "rate-limited" };
  return { ok: false, reason: "unavailable" };
}
