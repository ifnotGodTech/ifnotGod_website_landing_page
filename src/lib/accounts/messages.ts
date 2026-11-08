import type { AccountErrorCode } from "@/types/account";

const MESSAGES: Record<AccountErrorCode, string> = {
  INVALID_CREDENTIALS: "That email and password don't match. Check them and try again.",
  EMAIL_TAKEN: "There's already an account with that email. Log in instead, or reset your password.",
  TOO_MANY_ATTEMPTS: "Too many attempts. Please wait a few minutes, then try again.",
  UNAVAILABLE: "Accounts aren't available right now. Please try again later, or reach us on WhatsApp.",
  NOT_SUBSCRIBED: "You don't have an active plan. Choose a plan to get started.",
  ALREADY_SUBSCRIBED: "You already have an active plan. Change it from your account.",
  INVALID_SELECTION: "That choice isn't part of your plan. Check your selection and try again.",
  NO_CHANGES_LEFT: "You've used this month's changes. You can make more next month, or move to a bigger plan.",
  PAYMENT_NOT_FOUND: "We couldn't find that payment. Please start again from your account.",
};

export function accountErrorMessage(code: AccountErrorCode): string {
  return MESSAGES[code];
}
