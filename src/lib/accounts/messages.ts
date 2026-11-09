import type { AccountErrorCode } from "@/types/account";

const MESSAGES: Record<AccountErrorCode, string> = {
  INVALID_CREDENTIALS: "That email and password don't match. Check them and try again.",
  EMAIL_TAKEN: "There's already an account with that email. Log in instead, or reset your password.",
  WEAK_PASSWORD:
    "Choose a stronger password: at least 10 characters, not a common one, not only numbers, and not like your name or email.",
  RESET_LINK_INVALID: "This link has expired or has already been used. Ask for a new one below.",
  GOOGLE_FAILED: "We couldn't sign you in with Google. Please try again, or use your email and password.",
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
