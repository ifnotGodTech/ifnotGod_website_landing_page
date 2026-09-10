import { z } from "zod";

export const contactSubmissionSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  challenge: z
    .string()
    .trim()
    .min(10, "Tell us a bit more about the challenge (at least 10 characters).")
    .max(4000),
  desiredOutcome: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

export type ContactFieldErrors = Partial<Record<keyof ContactSubmissionInput, string>>;

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
