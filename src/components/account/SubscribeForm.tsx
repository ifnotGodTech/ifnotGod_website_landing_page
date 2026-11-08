"use client";

import { useActionState, useState } from "react";
import type { Quote } from "@/lib/accounts/billing";
import type { SubscriptionFormState } from "@/lib/accounts/subscriptionActions";
import type { BillingPeriod } from "@/types/account";
import type { PlanId } from "@/types/catalogue";
import { PRIMARY_BUTTON } from "./buttonStyles";

type Option<T> = { id: T; name: string; detail: string };

type SubscribeFormProps = {
  action: (state: SubscriptionFormState, form: FormData) => Promise<SubscriptionFormState>;
  plans: Option<PlanId>[];
  periods: Option<BillingPeriod>[];
  /** Worked out on the server for every plan and period, so the summary needs no sums here. */
  quotes: Record<string, Quote>;
  initialPlan: PlanId;
  initialPeriod: BillingPeriod;
  totals: Record<string, string>;
};

const CHOICE =
  "flex cursor-pointer items-start gap-3 rounded-[10px] border-2 border-line-light bg-white p-4.5 transition-colors hover:border-maroon has-[:checked]:border-maroon has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-maroon";

const key = (plan: string, period: string) => `${plan}:${period}`;

export function SubscribeForm({ action, plans, periods, quotes, initialPlan, initialPeriod, totals }: SubscribeFormProps) {
  const [state, formAction, pending] = useActionState(action, { formError: null });
  const [plan, setPlan] = useState(initialPlan);
  const [period, setPeriod] = useState(initialPeriod);
  const quote = quotes[key(plan, period)];
  const due = totals[key(plan, period)];

  return (
    <form action={formAction} aria-label="Choose your plan" className="flex flex-wrap items-start gap-8">
      <div className="flex min-w-0 grow-[999] basis-[560px] flex-col gap-8">
        <fieldset className="flex flex-col gap-3.5">
          <legend className="mb-3.5 font-display text-[1.5rem] font-extrabold">1. Plan</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {plans.map((option) => (
              <label key={option.id} className={CHOICE}>
                <input type="radio" name="plan" value={option.id} checked={plan === option.id} onChange={() => setPlan(option.id)} className="mt-1.5 accent-maroon" />
                <span className="flex flex-col">
                  <span className="font-display text-[1.25rem] font-extrabold">{option.name}</span>
                  <span className="font-semibold">{option.detail}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3.5 font-display text-[1.5rem] font-extrabold">2. How you&apos;d like to pay</legend>
          {periods.map((option) => (
            <label key={option.id} className={CHOICE}>
              <input type="radio" name="period" value={option.id} checked={period === option.id} onChange={() => setPeriod(option.id)} className="mt-1.5 accent-maroon" />
              <span className="flex grow flex-wrap justify-between gap-x-5 gap-y-1">
                <span className="flex flex-col">
                  <span className="font-bold">{option.name}</span>
                  <span className="text-[0.94rem] text-on-light-dim">{quotes[key(plan, option.id)].optionNote}</span>
                </span>
                <span className="font-display font-extrabold">{totals[key(plan, option.id)]}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <section aria-labelledby="summary-heading" className="flex min-w-0 grow basis-[320px] flex-col gap-4 rounded-xl border border-line-light bg-white p-7">
        <h2 id="summary-heading" className="text-[1.4rem] font-extrabold">
          Summary
        </h2>
        <dl className="flex flex-col gap-2.5">
          {quote.lines.map((line) => (
            <div key={line.label} className="flex justify-between gap-4">
              <dt>{line.label}</dt>
              <dd className="whitespace-nowrap font-semibold">{line.amount}</dd>
            </div>
          ))}
        </dl>
        <p className="flex justify-between gap-4 border-t border-line-light pt-3.5 font-display text-[1.4rem] font-extrabold">
          <span>Due today</span>
          <span aria-live="polite">{due}</span>
        </p>
        <p className="text-[0.94rem] text-on-light-dim">{quote.renewalNote}</p>
        <button type="submit" disabled={pending} className={PRIMARY_BUTTON}>
          {pending ? "Starting payment…" : `Pay ${due} with Flutterwave`}
        </button>
        <p role="status" aria-live="polite" className="font-semibold text-maroon empty:hidden">
          {state.formError}
        </p>
        <p className="text-[0.88rem] text-on-light-dim">
          You&apos;ll finish paying securely on Flutterwave. We never see or store your card details. Payments
          aren&apos;t refundable.
        </p>
      </section>
    </form>
  );
}
