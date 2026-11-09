import { z } from "zod";
import { apiRequest } from "@/lib/api/http";
import type { ApiError, ApiResult } from "@/lib/api/errors";
import type {
  AccountErrorCode,
  AccountResult,
  AccountUser,
  GoogleSignInInput,
  LogInInput,
  SetPasswordInput,
  SignedIn,
  SignUpInput,
} from "@/types/account";

// Client accounts, through the backend's /account/ endpoints. The token never reaches the browser:
// the actions keep it inside the encrypted session cookie and pass it back here.

const userSchema: z.ZodType<AccountUser> = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  businessName: z
    .string()
    .nullable()
    .transform((value) => value ?? undefined),
  signInMethod: z.enum(["password", "google"]),
});
const signedInSchema: z.ZodType<SignedIn> = z.object({ token: z.string().min(1), user: userSchema });
const noContent = z.unknown().transform(() => null);

const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

/** The backend's reason, as one of the codes the screens explain. */
export function accountErrorFor(error: ApiError): AccountErrorCode {
  switch (error.detailCode) {
    case "EMAIL_TAKEN":
      return "EMAIL_TAKEN";
    case "WEAK_PASSWORD":
      return "WEAK_PASSWORD";
    case "WRONG_DETAILS":
      return "INVALID_CREDENTIALS";
    case "RESET_LINK_INVALID":
      return "RESET_LINK_INVALID";
    case "GOOGLE_FAILED":
      return "GOOGLE_FAILED";
  }
  return error.code === "RATE_LIMITED" ? "TOO_MANY_ATTEMPTS" : "UNAVAILABLE";
}

function asAccountResult<T>(result: ApiResult<T>): AccountResult<T> {
  return result.ok ? { ok: true, value: result.data } : { ok: false, error: accountErrorFor(result.error) };
}

export async function signUp({ fullName, businessName, email, password }: SignUpInput): Promise<AccountResult<SignedIn>> {
  const body = { fullName, businessName: businessName ?? "", email, password };
  return asAccountResult(await apiRequest("/account/sign-up/", { method: "POST", body, schema: signedInSchema }));
}

export async function logIn({ email, password }: LogInInput): Promise<AccountResult<SignedIn>> {
  return asAccountResult(await apiRequest("/account/log-in/", { method: "POST", body: { email, password }, schema: signedInSchema }));
}

export async function signInWithGoogle(input: GoogleSignInInput): Promise<AccountResult<SignedIn>> {
  return asAccountResult(await apiRequest("/account/google/", { method: "POST", body: input, schema: signedInSchema }));
}

/** The same answer whether or not the email has an account. */
export async function requestPasswordReset(email: string): Promise<AccountResult<null>> {
  return asAccountResult(await apiRequest("/account/password-reset/", { method: "POST", body: { email }, schema: noContent }));
}

/** Sets a new password from a reset link. Every other session ends, and this one starts. */
export async function setNewPassword(input: SetPasswordInput): Promise<AccountResult<SignedIn>> {
  return asAccountResult(await apiRequest("/account/password-reset/new/", { method: "POST", body: input, schema: signedInSchema }));
}

/** Who the token belongs to. Each call counts as activity, restarting the backend's 7 days. */
export function getSignedInUser(token: string): Promise<ApiResult<AccountUser>> {
  return apiRequest("/account/me/", { schema: userSchema, headers: bearer(token) });
}

/** Revokes the token, so the session ends everywhere. */
export function logOut(token: string): Promise<ApiResult<null>> {
  return apiRequest("/account/log-out/", { method: "POST", schema: noContent, headers: bearer(token) });
}
