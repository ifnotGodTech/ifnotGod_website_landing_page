import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountBand } from "@/components/account/AccountBand";
import { Container } from "@/components/ui/Container";
import { requireSession } from "@/lib/accounts";
import { accountErrorMessage } from "@/lib/accounts/messages";
import { confirmPayment } from "@/lib/accounts/subscriptions";
import { buildPageMetadata } from "@/shared/metadata";
import type { AccountErrorCode } from "@/types/account";

export const metadata = buildPageMetadata({
  title: "Payment | IFNOTGOD TECH LTD",
  description: "Confirming your payment.",
  path: "/account/subscribe/paid",
  index: false,
});

const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : "");

// Flutterwave sends the client back here after paying, with our reference and its transaction id.
// The backend checks the payment with Flutterwave before starting the plan: this address alone proves nothing.
export default async function PaidPage({ searchParams }: PageProps<"/account/subscribe/paid">) {
  const { token } = await requireSession("/account");
  const query = await searchParams;
  const reference = one(query.tx_ref);
  const transactionId = Number(one(query.transaction_id)) || null;

  let problem: AccountErrorCode | "CANCELLED" = "CANCELLED";
  if (reference && one(query.status) !== "cancelled") {
    const result = await confirmPayment(token, reference, transactionId);
    if (result.ok) redirect("/account/services?welcome=1");
    problem = result.error;
  }

  const cancelled = problem === "CANCELLED";
  return (
    <>
      <AccountBand
        back
        title={cancelled ? "Payment cancelled" : "Payment not confirmed"}
        intro={cancelled ? "You haven't been charged, and no plan has started." : accountErrorMessage(problem as AccountErrorCode)}
      />
      <Container className="flex flex-wrap gap-x-6 gap-y-3 pb-22 pt-10">
        <Link href="/account/subscribe" className="font-semibold text-maroon underline hover:text-maroon-bright">
          Choose a plan and try again
        </Link>
        <Link href="/account" className="font-semibold text-maroon underline hover:text-maroon-bright">
          Go to your account
        </Link>
      </Container>
    </>
  );
}
