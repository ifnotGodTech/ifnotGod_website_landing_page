import type { AccountErrorCode } from "@/types/account";

const MESSAGES: Record<AccountErrorCode, string> = {
  INVALID_CREDENTIALS: "That email and password don't match. Check them and try again.",
  EMAIL_TAKEN: "There's already an account with that email. Log in instead, or reset your password.",
  TOO_MANY_ATTEMPTS: "Too many attempts. Please wait a few minutes, then try again.",
  UNAVAILABLE: "Accounts aren't available right now. Please try again later, or reach us on WhatsApp.",
};

export function accountErrorMessage(code: AccountErrorCode): string {
  return MESSAGES[code];
}
