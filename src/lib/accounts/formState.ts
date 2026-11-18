import type { FieldErrors } from "@/shared/validators/account";

export type AuthFormState = {
  status: "idle" | "error" | "success";
  fieldErrors: FieldErrors;
  formError: string | null;
  /** What the visitor typed, except passwords, so a returned form keeps it. */
  values: Record<string, string>;
};

export const INITIAL_AUTH_STATE: AuthFormState = { status: "idle", fieldErrors: {}, formError: null, values: {} };
