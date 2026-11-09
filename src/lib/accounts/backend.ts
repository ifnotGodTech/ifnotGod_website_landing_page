import type { AccountResult, AccountUser, Checkout, Payment, Subscription } from "@/types/account";
import type { PlanId } from "@/types/catalogue";

/** What the subscription screens need, until backend phases 5 and 6 build it. The stand-in provides it.
 * Accounts themselves already use the real API: see api.ts. */
export type AccountsBackend = {
  getSubscription(user: AccountUser): Promise<AccountResult<Subscription | null>>;
  getPayments(user: AccountUser): Promise<AccountResult<Payment[]>>;
  /** Whether the client has paid a setup fee before, so it isn't charged twice. */
  hasPaidSetupFee(user: AccountUser): Promise<AccountResult<boolean>>;
  /** Where to send the client to pay. The real API returns a Flutterwave payment page. */
  startCheckout(user: AccountUser, checkout: Checkout): Promise<AccountResult<{ redirectTo: string }>>;
  /** After paying, confirms the payment by its reference and starts the subscription. */
  confirmCheckout(user: AccountUser, reference: string): Promise<AccountResult<Subscription>>;
  /** Switches plan at the next renewal. */
  changePlan(user: AccountUser, planId: PlanId): Promise<AccountResult<Subscription>>;
  updateServices(user: AccountUser, serviceIds: string[]): Promise<AccountResult<Subscription>>;
  cancelSubscription(user: AccountUser, reason?: string): Promise<AccountResult<Subscription>>;
  /** Undoes a cancellation while the paid period is still running. */
  resumeSubscription(user: AccountUser): Promise<AccountResult<Subscription>>;
};

export const ok = <T>(value: T): AccountResult<T> => ({ ok: true, value });
export const fail = <T>(error: Extract<AccountResult<T>, { ok: false }>["error"]): AccountResult<T> => ({
  ok: false,
  error,
});
