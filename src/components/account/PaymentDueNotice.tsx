import { formatNaira } from "@/lib/catalogue/rules";
import { formatLongDate } from "@/shared/dates";
import type { PaymentDue } from "@/types/account";

/** A renewal that hasn't been paid yet. The plan keeps working for a few days while the client pays. */
export function PaymentDueNotice({ due }: { due: PaymentDue }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-maroon bg-[#fbeaec] px-6 py-5">
      <p className="max-w-[46em]">
        <strong>Your renewal payment hasn&apos;t gone through yet.</strong> Everything keeps working until{" "}
        {formatLongDate(due.workingUntil)}. {due.payUrl ? "Pay now to keep your plan running." : "We've emailed you a link to pay."}
      </p>
      {due.payUrl && (
        <a
          href={due.payUrl}
          className="inline-flex min-h-11 items-center rounded-md bg-maroon px-5 font-bold text-paper transition-colors hover:bg-maroon-bright"
        >
          {due.amount === null ? "Pay now" : `Pay ${formatNaira(due.amount)}`}
        </a>
      )}
    </div>
  );
}
