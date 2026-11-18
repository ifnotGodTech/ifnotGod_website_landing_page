import { formatNaira } from "@/lib/catalogue/rules";
import type { BillingPeriod } from "@/types/account";
import type { BillingTerms, Plan } from "@/types/catalogue";

export const BILLING_PERIODS: readonly { id: BillingPeriod; months: number; label: string }[] = [
  { id: "monthly", months: 1, label: "Monthly" },
  { id: "six-months", months: 6, label: "6 months upfront" },
  { id: "twelve-months", months: 12, label: "12 months upfront" },
];

export function isBillingPeriod(value: unknown): value is BillingPeriod {
  return BILLING_PERIODS.some((period) => period.id === value);
}

export function periodMonths(period: BillingPeriod): number {
  return BILLING_PERIODS.find((item) => item.id === period)?.months ?? 1;
}

export type QuoteLine = { label: string; amount: string };

export type Quote = {
  lines: QuoteLine[];
  /** In naira. */
  dueToday: number;
  /** Shown under each payment option. */
  optionNote: string;
  renewalNote: string;
};

/** What a client pays today for a plan and period. Only priced plans can be bought online. */
export function buildQuote(plan: Plan, period: BillingPeriod, terms: BillingTerms, { setupFeePaid = false } = {}): Quote {
  const price = plan.monthlyPrice ?? 0;
  const months = periodMonths(period);
  const freeMonths = months === 12 ? terms.freeMonthsOnTwelve : 0;
  const setupFee = !setupFeePaid && months < terms.setupFeeWaivedFromMonths ? terms.setupFee : 0;

  const lines: QuoteLine[] = [
    { label: months === 1 ? `${plan.name}, first month` : `${plan.name}, ${months} months`, amount: formatNaira(price * months) },
  ];
  if (freeMonths) lines.push({ label: `${freeMonths} months free`, amount: `−${formatNaira(price * freeMonths)}` });
  if (setupFee) lines.push({ label: "One-time setup fee", amount: formatNaira(setupFee) });
  else if (!setupFeePaid) lines.push({ label: "Setup fee", amount: "Waived" });

  const reminder = "and we remind you before each renewal. Cancel any time.";
  return {
    lines,
    dueToday: price * (months - freeMonths) + setupFee,
    optionNote:
      months === 1
        ? setupFeePaid
          ? "Cancel any time."
          : `Plus a one-time setup fee of ${formatNaira(terms.setupFee)}. Cancel any time.`
        : months === 12
          ? `${terms.freeMonthsOnTwelve} months free, and no setup fee.`
          : "No setup fee.",
    renewalNote:
      months === 1
        ? `Then ${formatNaira(price)} a month. Your plan renews automatically each month, ${reminder}`
        : `Covers ${months} months. Your plan renews automatically when they end, ${reminder}`,
  };
}
