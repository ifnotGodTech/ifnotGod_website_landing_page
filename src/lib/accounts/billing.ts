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

const monthsFree = (count: number) => `${count} ${count === 1 ? "month" : "months"} free`;
const sentence = (parts: string[]) => {
  const text = parts.join(", and ");
  return `${text[0].toUpperCase()}${text.slice(1)}.`;
};

/** Whether this period's payment carries the setup fee, by the terms the team sets in the dashboard. */
export function chargesSetupFee(months: number, terms: BillingTerms, setupFeePaid: boolean): boolean {
  return !setupFeePaid && terms.setupFee > 0 && months < terms.setupFeeWaivedFromMonths;
}

/** What a client pays today for a plan and period. Only priced plans can be bought online. */
export function buildQuote(plan: Plan, period: BillingPeriod, terms: BillingTerms, { setupFeePaid = false } = {}): Quote {
  const price = plan.monthlyPrice ?? 0;
  const months = periodMonths(period);
  const freeMonths = months === 12 ? terms.freeMonthsOnTwelve : 0;
  const setupFee = chargesSetupFee(months, terms, setupFeePaid) ? terms.setupFee : 0;
  // "Waived" only means something when there is a fee this payment doesn't carry.
  const waived = !setupFeePaid && terms.setupFee > 0 && !setupFee;

  const lines: QuoteLine[] = [
    { label: months === 1 ? `${plan.name}, first month` : `${plan.name}, ${months} months`, amount: formatNaira(price * months) },
  ];
  if (freeMonths) lines.push({ label: monthsFree(freeMonths), amount: `−${formatNaira(price * freeMonths)}` });
  if (setupFee) lines.push({ label: "One-time setup fee", amount: formatNaira(setupFee) });
  else if (waived) lines.push({ label: "Setup fee", amount: "Waived" });

  const notes = [
    ...(freeMonths ? [monthsFree(freeMonths)] : []),
    ...(setupFee ? [`plus a one-time setup fee of ${formatNaira(setupFee)}`] : waived ? ["no setup fee"] : []),
  ];
  const reminder = "and we remind you before each renewal. Cancel any time.";
  return {
    lines,
    dueToday: price * (months - freeMonths) + setupFee,
    optionNote: months === 1 ? (setupFee ? `Plus a one-time setup fee of ${formatNaira(setupFee)}. Cancel any time.` : "Cancel any time.") : notes.length ? sentence(notes) : "Cancel any time.",
    renewalNote:
      months === 1
        ? `Then ${formatNaira(price)} a month. Your plan renews automatically each month, ${reminder}`
        : `Covers ${months} months. Your plan renews automatically when they end, ${reminder}`,
  };
}

/** The pricing page's plan terms about the setup fee and paying upfront. */
export function describeBillingTerms(terms: BillingTerms): { setupFee: string; freeMonths: string | null } {
  const upfront = terms.setupFeeWaivedFromMonths === 12 ? "12 months" : "6 or 12 months";
  return {
    setupFee: terms.setupFee > 0 ? `One-time setup fee of ${formatNaira(terms.setupFee)}, waived when you pay ${upfront} upfront.` : "No setup fee.",
    freeMonths: terms.freeMonthsOnTwelve > 0 ? `Pay 12 months upfront and get ${monthsFree(terms.freeMonthsOnTwelve)}.` : null,
  };
}
