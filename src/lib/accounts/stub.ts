import { getBillingTerms, getPlanChoices, getPlans } from "@/lib/catalogue";
import { addMonths, todayInLagos } from "@/shared/dates";
import type { AccountUser, Checkout } from "@/types/account";
import { fail, ok, type AccountsBackend } from "./backend";
import { BILLING_PERIODS, buildQuote, isBillingPeriod, periodMonths } from "./billing";
import { checkServiceSelection, selfServiceChoices } from "./serviceSelection";
import { cookieStubStore, type StubStore } from "./stubStore";

// A stand-in backend until the real one exists (phase 12). Any email and password logs in,
// and a few fixed values show each error, for previews and tests:
export const STUB_RULES = {
  takenEmail: "taken@example.com",
  lockedEmail: "locked@example.com",
  wrongPassword: "wrong-password",
} as const;

function stubUser(user: Omit<AccountUser, "id">): AccountUser {
  return { id: `stub-${Buffer.from(user.email.toLowerCase()).toString("base64url")}`, ...user };
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return local.replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Client";
}

export const encodeReference = (checkout: Checkout) => Buffer.from(JSON.stringify(checkout)).toString("base64url");

/** Reads a stand-in payment reference. Only the stand-in payment page uses this. */
export function decodeReference(reference: string): Checkout | null {
  try {
    const value = JSON.parse(Buffer.from(reference, "base64url").toString("utf8"));
    return typeof value?.planId === "string" && isBillingPeriod(value.billingPeriod) ? value : null;
  } catch {
    return null;
  }
}

async function pricedPlan(planId: string) {
  const plan = (await getPlans()).find((candidate) => candidate.id === planId);
  return plan && plan.monthlyPrice !== null ? plan : null;
}

export function createStubBackend(store: StubStore = cookieStubStore, today = () => todayInLagos()): AccountsBackend {
  return {
    async signUp({ fullName, businessName, email }) {
      if (email.toLowerCase() === STUB_RULES.takenEmail) return fail("EMAIL_TAKEN");
      return ok(stubUser({ fullName, businessName, email, signInMethod: "password" }));
    },
    async logIn({ email, password }) {
      if (email.toLowerCase() === STUB_RULES.lockedEmail) return fail("TOO_MANY_ATTEMPTS");
      if (password === STUB_RULES.wrongPassword) return fail("INVALID_CREDENTIALS");
      return ok(stubUser({ fullName: nameFromEmail(email), email, signInMethod: "password" }));
    },
    async signInWithGoogle() {
      return ok(stubUser({ fullName: "Ada Obi", email: "ada@example.com", signInMethod: "google" }));
    },
    async requestPasswordReset() {
      return ok(null);
    },

    async getSubscription(user) {
      return ok((await store.read(user.id)).subscription);
    },
    async getPayments(user) {
      return ok((await store.read(user.id)).payments);
    },
    async hasPaidSetupFee(user) {
      return ok((await store.read(user.id)).setupFeePaid);
    },

    async startCheckout(user, checkout) {
      if (!(await pricedPlan(checkout.planId)) || !isBillingPeriod(checkout.billingPeriod)) return fail("INVALID_SELECTION");
      if ((await store.read(user.id)).subscription) return fail("ALREADY_SUBSCRIBED");
      return ok({ redirectTo: `/account/subscribe/pay?ref=${encodeReference(checkout)}` });
    },

    async confirmCheckout(user, reference) {
      const checkout = decodeReference(reference);
      const plan = checkout && (await pricedPlan(checkout.planId));
      if (!checkout || !plan) return fail("PAYMENT_NOT_FOUND");

      const state = await store.read(user.id);
      if (state.subscription) return fail("ALREADY_SUBSCRIBED");

      const quote = buildQuote(plan, checkout.billingPeriod, await getBillingTerms(), { setupFeePaid: state.setupFeePaid });
      const period = BILLING_PERIODS.find((item) => item.id === checkout.billingPeriod)!;
      const date = today();
      const subscription = {
        planId: plan.id,
        billingPeriod: checkout.billingPeriod,
        status: "active" as const,
        currentPeriodEnd: addMonths(date, periodMonths(checkout.billingPeriod)),
        serviceIds: [],
        changesLeftThisMonth: typeof plan.monthlyChanges === "number" ? plan.monthlyChanges : 0,
      };
      const chargedSetupFee = quote.lines.some((line) => line.label === "One-time setup fee");

      await store.write({
        ...state,
        subscription,
        setupFeePaid: true,
        payments: [
          {
            id: `pay-${state.payments.length + 1}`,
            paidOn: date,
            description: `${plan.name}, ${period.label.toLowerCase()}${chargedSetupFee ? ", and setup fee" : ""}`,
            amount: quote.dueToday,
          },
          ...state.payments,
        ],
      });
      return ok(subscription);
    },

    async changePlan(user, planId) {
      const state = await store.read(user.id);
      if (state.subscription?.status !== "active") return fail("NOT_SUBSCRIBED");
      if (!(await pricedPlan(planId))) return fail("INVALID_SELECTION");

      const pendingPlanId = planId === state.subscription.planId ? undefined : planId;
      const subscription = { ...state.subscription, pendingPlanId };
      await store.write({ ...state, subscription });
      return ok(subscription);
    },

    async updateServices(user, serviceIds) {
      const state = await store.read(user.id);
      const current = state.subscription;
      if (current?.status !== "active") return fail("NOT_SUBSCRIBED");

      const choices = selfServiceChoices(await getPlanChoices(current.planId));
      const check = checkServiceSelection(choices, current.serviceIds, serviceIds, current.changesLeftThisMonth);
      if (!check.ok) return fail(check.error);

      const subscription = {
        ...current,
        serviceIds,
        changesLeftThisMonth: current.changesLeftThisMonth - check.changesUsed,
      };
      await store.write({ ...state, subscription });
      return ok(subscription);
    },

    async cancelSubscription(user) {
      const state = await store.read(user.id);
      if (state.subscription?.status !== "active") return fail("NOT_SUBSCRIBED");

      const subscription = { ...state.subscription, status: "cancelled" as const, pendingPlanId: undefined };
      await store.write({ ...state, subscription });
      return ok(subscription);
    },

    async resumeSubscription(user) {
      const state = await store.read(user.id);
      if (state.subscription?.status !== "cancelled") return fail("NOT_SUBSCRIBED");

      const subscription = { ...state.subscription, status: "active" as const };
      await store.write({ ...state, subscription });
      return ok(subscription);
    },
  };
}
