import { redirect } from "next/navigation";
import { AccountBand } from "@/components/account/AccountBand";
import { ActionForm } from "@/components/account/ActionForm";
import { Container } from "@/components/ui/Container";
import { requireUser } from "@/lib/accounts";
import { getBillingTerms, loadAccount } from "@/lib/accounts/account";
import { BILLING_PERIODS, buildQuote } from "@/lib/accounts/billing";
import { decodeReference } from "@/lib/accounts/stub";
import { confirmStubPaymentAction } from "@/lib/accounts/subscriptionActions";
import { getPlan } from "@/lib/catalogue";
import { formatNaira } from "@/lib/catalogue/rules";
import { buildPageMetadata } from "@/shared/metadata";

export const metadata = buildPageMetadata({
  title: "Payment | IFNOTGOD TECH LTD",
  description: "Stand-in payment step.",
  path: "/account/subscribe/pay",
  index: false,
});

// Stands in for Flutterwave's payment page until phase 12. The stand-in backend refuses to run
// in production, so this page can never take the place of a real payment there.
export default async function StubPaymentPage({ searchParams }: PageProps<"/account/subscribe/pay">) {
  const user = await requireUser("/account/subscribe");
  const reference = String((await searchParams).ref ?? "");
  const checkout = decodeReference(reference);
  const plan = checkout ? await getPlan(checkout.planId) : undefined;
  if (!checkout || !plan) redirect("/account/subscribe");

  const { setupFeePaid } = await loadAccount(user);
  const quote = buildQuote(plan, checkout.billingPeriod, await getBillingTerms(), { setupFeePaid });
  const period = BILLING_PERIODS.find((item) => item.id === checkout.billingPeriod);

  return (
    <>
      <AccountBand back title="Payment" intro="This is a stand-in for Flutterwave while the site is being built. No money is taken." />
      <Container className="pb-22 pt-10">
        <div className="flex max-w-[560px] flex-col gap-5 rounded-xl border border-line-light bg-white p-6 sm:p-8">
          <h2 className="text-[1.5rem] font-extrabold">
            {plan.name}, {period?.label.toLowerCase()}
          </h2>
          <dl className="flex flex-col gap-2.5">
            {quote.lines.map((line) => (
              <div key={line.label} className="flex justify-between gap-4">
                <dt>{line.label}</dt>
                <dd className="font-semibold">{line.amount}</dd>
              </div>
            ))}
          </dl>
          <ActionForm action={confirmStubPaymentAction} label="Payment" submitLabel={`Pay ${formatNaira(quote.dueToday)}`} pendingLabel="Paying…">
            <input type="hidden" name="ref" value={reference} />
          </ActionForm>
        </div>
      </Container>
    </>
  );
}
