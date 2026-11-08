import { z } from "zod";

const email = z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address.");

export const logInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  businessName: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((value) => value || undefined),
  email,
  password: z.string().min(8, "Use at least 8 characters.").max(128, "Use 128 characters or fewer."),
});

export const resetPasswordSchema = z.object({ email });

export type FieldErrors = Record<string, string>;

export function parseForm<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: FieldErrors } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { success: false, errors };
}
