import Link from "next/link";
import type { AccountOverview } from "@/lib/accounts/account";
import { BILLING_PERIODS } from "@/lib/accounts/billing";
import { formatNaira } from "@/lib/catalogue/rules";
import { formatLongDate } from "@/shared/dates";
import type { Payment } from "@/types/account";
import { OUTLINE_BUTTON, PRIMARY_BUTTON } from "./buttonStyles";

const CARD = "flex flex-col gap-5 rounded-xl border border-line-light bg-white p-6 sm:p-8";

export function NoPlanCard() {
  return (
    <section aria-labelledby="plan-heading" className={`${CARD} items-start`}>
      <h2 id="plan-heading" className="text-[1.5rem] font-extrabold">
        Your plan
      </h2>
      <p className="text-on-light-dim">You haven&apos;t subscribed yet. Choose a plan to get started.</p>
      <Link href="/account/subscribe" className={PRIMARY_BUTTON}>
        Choose a plan
      </Link>
    </section>
  );
}

export function PlanCard({ overview }: { overview: AccountOverview }) {
  const { subscription, plan, pendingPlan, choices } = overview;
  if (!subscription || !plan) return null;

  const active = subscription.status === "active";
  const period = BILLING_PERIODS.find((item) => item.id === subscription.billingPeriod);
  const date = formatLongDate(subscription.currentPeriodEnd);

  return (
    <section aria-labelledby="plan-heading" className={CARD}>
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
        <div className="flex flex-col gap-1">
          <h2 id="plan-heading" className="text-[1.6rem] font-extrabold">
            {plan.name} plan
          </h2>
          <p className="text-on-light-dim">
            {formatNaira(plan.monthlyPrice ?? 0)} a month, paid {period?.label.toLowerCase()}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[0.88rem] font-bold ${active ? "bg-[#e6f2ea] text-[#1d5a33]" : "bg-[#fff4e8] text-[#7a3d0c]"}`}>
          {active ? "Active" : `Ends ${date}`}
        </span>
      </div>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
        <div>
          <dt className="font-semibold">{active ? "Renews automatically" : "Everything keeps working until"}</dt>
          <dd className="text-on-light-dim">{date}</dd>
          <dd className="text-[0.94rem] text-on-light-dim">
            {active ? "We'll remind you a few days before." : "Your plan won't renew."}
          </dd>
        </div>
        {pendingPlan && active && (
          <div>
            <dt className="font-semibold">Plan change</dt>
            <dd className="text-on-light-dim">Moves to {pendingPlan.name} on {date}</dd>
          </div>
        )}
        <div>
          <dt className="font-semibold">Changes left this month</dt>
          <dd className="text-on-light-dim">{subscription.changesLeftThisMonth}</dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 gap-x-8 gap-y-5 border-t border-line-light pt-5 sm:grid-cols-2 lg:grid-cols-3">
        {choices.map((choice) => {
          const services = choice.services.filter((service) => subscription.serviceIds.includes(service.id));
          return (
            <div key={choice.group.id} className="flex flex-col gap-1.5">
              <h3 className="text-[1.05rem] font-extrabold">{choice.label}</h3>
              {services.length ? (
                <ul className="list-disc pl-5 text-on-light-dim">
                  {services.map((service) => (
                    <li key={service.id}>{service.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-on-light-dim">Not chosen yet</p>
              )}
            </div>
          );
        })}
      </div>

      {active && (
        <div className="flex flex-wrap gap-3">
          <Link href="/account/services" className={PRIMARY_BUTTON}>
            {subscription.serviceIds.length ? "Change services" : "Choose your services"}
          </Link>
          <Link href="/account/subscribe" className={OUTLINE_BUTTON}>
            Change plan
          </Link>
          <Link href="/account/cancel" className={OUTLINE_BUTTON}>
            Cancel subscription
          </Link>
        </div>
      )}
    </section>
  );
}

export function PaymentsCard({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) return null;

  return (
    <section aria-labelledby="payments-heading" className={CARD}>
      <h2 id="payments-heading" className="text-[1.5rem] font-extrabold">
        Payments
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-[0.88rem] text-on-light-dim">
              <th scope="col" className="py-2 pr-4 font-semibold">Date</th>
              <th scope="col" className="px-4 py-2 font-semibold">For</th>
              <th scope="col" className="py-2 pl-4 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t border-line-light">
                <td className="whitespace-nowrap py-2.5 pr-4">{formatLongDate(payment.paidOn)}</td>
                <td className="px-4 py-2.5">{payment.description}</td>
                <td className="py-2.5 pl-4 text-right font-semibold">{formatNaira(payment.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
