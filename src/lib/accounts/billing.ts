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
  // "2 months free, plus a one-time setup fee" but "1 month free, and no setup fee".
  const text = parts.reduce((joined, part) => (joined ? `${joined}${part.startsWith("plus") ? ", " : ", and "}${part}` : part), "");
  return `${text[0].toUpperCase()}${text.slice(1)}.`;
};

/** One way of paying, with the terms the team set for it. */
export type PaymentOption = {
  period: BillingPeriod;
  label: string;
  months: number;
  /** "pay monthly", "pay 6 months upfront", for sentences. */
  paying: string;
  setupFeeWaived: boolean;
  freeMonths: number;
};

export function paymentOptions(terms: BillingTerms): PaymentOption[] {
  const waived = { monthly: terms.monthlySetupFeeWaived, "six-months": terms.sixMonthsSetupFeeWaived, "twelve-months": terms.twelveMonthsSetupFeeWaived };
  const free = { monthly: 0, "six-months": terms.sixMonthsFreeMonths, "twelve-months": terms.twelveMonthsFreeMonths };
  return BILLING_PERIODS.map(({ id, months, label }) => ({
    period: id,
    label,
    months,
    paying: months === 1 ? "pay monthly" : `pay ${months} months upfront`,
    setupFeeWaived: waived[id],
    freeMonths: free[id],
  }));
}

function optionFor(period: BillingPeriod, terms: BillingTerms): PaymentOption {
  return paymentOptions(terms).find((option) => option.period === period)!;
}

/** Whether this payment carries the setup fee, by the terms the team sets in the dashboard. */
export function chargesSetupFee(period: BillingPeriod, terms: BillingTerms, setupFeePaid: boolean): boolean {
  return !setupFeePaid && terms.setupFee > 0 && !optionFor(period, terms).setupFeeWaived;
}

/** What a client pays today for a plan and period. Only priced plans can be bought online. */
export function buildQuote(plan: Plan, period: BillingPeriod, terms: BillingTerms, { setupFeePaid = false } = {}): Quote {
  const price = plan.monthlyPrice ?? 0;
  const { months, freeMonths } = optionFor(period, terms);
  const setupFee = chargesSetupFee(period, terms, setupFeePaid) ? terms.setupFee : 0;
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
    optionNote: months === 1 ? `${notes.length ? sentence(notes) + " " : ""}Cancel any time.` : notes.length ? sentence(notes) : "Cancel any time.",
    renewalNote:
      months === 1
        ? `Then ${formatNaira(price)} a month. Your plan renews automatically each month, ${reminder}`
        : `Covers ${months} months. Your plan renews automatically when they end, ${reminder}`,
  };
}

const orList = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} or ${items.at(-1)}`);

/** The pricing page's plan terms about the setup fee and paying upfront, such as "Pay 12 months upfront and get 2 months free." */
export function describeBillingTerms(terms: BillingTerms): { setupFee: string; offers: string[] } {
  const options = paymentOptions(terms);
  const waivedFor = options.filter((option) => option.setupFeeWaived).map((option) => option.paying.replace(/^pay /, ""));
  const fee = formatNaira(terms.setupFee);
  const setupFee =
    terms.setupFee === 0 || waivedFor.length === options.length
      ? "No setup fee."
      : waivedFor.length
        ? `One-time setup fee of ${fee}, waived when you pay ${orList(waivedFor)}.`
        : `One-time setup fee of ${fee} on your first subscription.`;
  const feeStillApplies = (option: PaymentOption) => terms.setupFee > 0 && !option.setupFeeWaived;
  const offers = options
    .filter((option) => option.freeMonths > 0)
    .map(
      (option) =>
        `${option.paying[0].toUpperCase()}${option.paying.slice(1)} and get ${monthsFree(option.freeMonths)}.${feeStillApplies(option) ? " The setup fee still applies." : ""}`
    );
  return { setupFee, offers };
}

/** The plan terms listed on the pricing page, and in the public pricing endpoint. */
export function planTerms(terms: BillingTerms): string[] {
  const { setupFee, offers } = describeBillingTerms(terms);
  return [
    setupFee,
    "Pay month by month. There's no minimum term.",
    "Your plan renews automatically, and we remind you before each renewal.",
    ...offers,
    "WhatsApp messages, AI usage and other third-party costs are billed at cost.",
    "We're alerted the moment anything fails, on every plan.",
  ];
}
