import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountBand } from "@/components/account/AccountBand";
import { ActionForm } from "@/components/account/ActionForm";
import { PRIMARY_BUTTON } from "@/components/account/buttonStyles";
import { Container } from "@/components/ui/Container";
import { requireSession } from "@/lib/accounts";
import { loadAccount } from "@/lib/accounts/account";
import { cancelSubscriptionAction } from "@/lib/accounts/subscriptionActions";
import { CONTACT_INFO } from "@/shared/constants";
import { formatLongDate } from "@/shared/dates";
import { buildPageMetadata } from "@/shared/metadata";

export const metadata = buildPageMetadata({
  title: "Cancel subscription | IFNOTGOD TECH LTD",
  description: "Cancel your IFNOTGOD TECH subscription.",
  path: "/account/cancel",
  index: false,
});

const REASONS = [
  "It costs too much",
  "It isn't saving me enough time",
  "I only needed it for a while",
  "I'm moving to another provider",
  "Something else",
];

export default async function CancelPage() {
  const { token } = await requireSession("/account/cancel");
  const { subscription, plan } = await loadAccount(token);
  if (subscription?.status !== "active" || !plan) redirect("/account");

  const date = formatLongDate(subscription.currentPeriodEnd);

  return (
    <>
      <AccountBand back title={`Cancel your ${plan.name} plan?`} />
      <Container className="flex max-w-[720px] flex-col gap-6 pb-22 pt-10">
        <section aria-labelledby="next-heading" className="flex flex-col gap-3 rounded-xl border border-line-light bg-white p-6 sm:p-8">
          <h2 id="next-heading" className="text-[1.3rem] font-extrabold">
            What happens next
          </h2>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-on-light-dim">
            <li>
              Everything in your plan, including your automations and website, keeps working until <strong>{date}</strong>.
            </li>
            <li>Your plan won&apos;t renew, and we won&apos;t charge you again.</li>
            <li>After that date, your automations stop, because they run on our systems.</li>
            <li>Your website is yours to keep.</li>
            <li>Payments aren&apos;t refundable, including for the rest of this period.</li>
          </ul>
        </section>

        <Link href="/account" className={`${PRIMARY_BUTTON} w-fit`}>
          Keep my plan
        </Link>

        <ActionForm action={cancelSubscriptionAction} label="Cancel subscription" submitLabel="Cancel subscription" pendingLabel="Cancelling…" variant="outline">
          <div className="flex max-w-[420px] flex-col gap-1.5">
            <label htmlFor="reason" className="font-semibold">
              Why are you leaving? (optional)
            </label>
            <select id="reason" name="reason" defaultValue="" className="min-h-11.5 rounded-md border border-on-light-dim/70 bg-white px-3 text-base">
              <option value="">Choose a reason</option>
              {REASONS.map((reason) => (
                <option key={reason}>{reason}</option>
              ))}
            </select>
          </div>
        </ActionForm>

        <p className="text-on-light-dim">
          Is something not working as it should?{" "}
          <a href={CONTACT_INFO.whatsappHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-maroon underline">
            Tell us on WhatsApp
          </a>{" "}
          first, and we&apos;ll try to fix it.
        </p>
      </Container>
    </>
  );
}
