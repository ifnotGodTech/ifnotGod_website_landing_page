import { z } from "zod";

const email = z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address.");

/** Matches the backend's minimum. The backend also refuses common and all-number passwords. */
export const MIN_PASSWORD_LENGTH = 10;
const newPassword = () =>
  z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`).max(128, "Use 128 characters or fewer.");

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
  password: newPassword(),
});

export const resetPasswordSchema = z.object({ email });

export const setPasswordSchema = z.object({
  uid: z.string().min(1).max(64),
  token: z.string().min(1).max(128),
  password: newPassword(),
});

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
