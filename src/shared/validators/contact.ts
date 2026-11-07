import { z } from "zod";
import type { PlanId } from "@/types/catalogue";

const PLAN_IDS = ["starter", "growth", "pro", "custom"] as const satisfies readonly PlanId[];

export const contactSubmissionSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  challenge: z
    .string()
    .trim()
    .min(10, "Tell us a bit more about the task or problem (at least 10 characters).")
    .max(4000),
  // "Not sure yet" is sent as an empty string and stored as no plan.
  plan: z
    .enum([...PLAN_IDS, ""], { message: "Choose a plan from the list." })
    .optional()
    .transform((plan) => plan || undefined),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

export type ContactFieldErrors = Partial<Record<keyof ContactSubmissionInput, string>>;

/** Reads a plan from a link such as /audit?plan=growth, ignoring anything that isn't a plan. */
export function parsePlanParam(value: unknown): PlanId | undefined {
  return PLAN_IDS.find((id) => id === value);
}

export function parseContactSubmission(data: unknown):
  | { success: true; data: ContactSubmissionInput }
  | { success: false; errors: ContactFieldErrors } {
  const result = contactSubmissionSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: ContactFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ContactSubmissionInput | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return { success: false, errors };
}
