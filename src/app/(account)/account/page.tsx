import { AccountBand } from "@/components/account/AccountBand";
import { ActionForm } from "@/components/account/ActionForm";
import { NoPlanCard, PaymentsCard, PlanCard } from "@/components/account/AccountSummary";
import { Container } from "@/components/ui/Container";
import { requireSession } from "@/lib/accounts";
import { loadAccount } from "@/lib/accounts/account";
import { resumeSubscriptionAction } from "@/lib/accounts/subscriptionActions";
import { formatLongDate } from "@/shared/dates";
import { buildPageMetadata } from "@/shared/metadata";

export const metadata = buildPageMetadata({
  title: "Your account | IFNOTGOD TECH LTD",
  description: "Your IFNOTGOD TECH plan, payments and details.",
  path: "/account",
  index: false,
});

const SIGN_IN_METHOD = { password: "Email and password", google: "Google" } as const;

const UPDATES: Record<string, string> = {
  services: "Your services are saved. We'll confirm with you before we switch anything over.",
  plan: "Your plan change is saved.",
  cancelled: "Your subscription is cancelled.",
  resumed: "Your plan will keep renewing as before.",
};

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const { user, token } = await requireSession("/account");
  const [overview, { updated }] = await Promise.all([loadAccount(token), searchParams]);
  const { subscription } = overview;
  const notice = typeof updated === "string" ? UPDATES[updated] : undefined;

  return (
    <>
      <AccountBand
        title={`Hello, ${user.fullName.split(" ")[0]}`}
        intro={`${user.businessName ? `${user.businessName} · ` : ""}${user.email}`}
      />

      <Container className="flex flex-col gap-7 pb-22 pt-10">
        {notice && (
          <p role="status" className="rounded-lg border border-[#1d5a33]/40 bg-[#e6f2ea] px-5 py-3.5 font-semibold text-[#1d5a33]">
            {notice}
          </p>
        )}

        {subscription?.status === "cancelled" && (
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-orange bg-[#fff4e8] px-6 py-5">
            <p className="max-w-[46em]">
              <strong>Your subscription is cancelled.</strong> Everything keeps working until{" "}
              {formatLongDate(subscription.currentPeriodEnd)}. Then your automations stop, and your website is yours to
              keep.
            </p>
            <ActionForm action={resumeSubscriptionAction} label="Keep my plan" submitLabel="Keep my plan" pendingLabel="Saving…" />
          </div>
        )}

        {subscription ? <PlanCard overview={overview} /> : <NoPlanCard />}
        <PaymentsCard payments={overview.payments} />

        <section aria-labelledby="details-heading" className="flex flex-col gap-3 rounded-xl border border-line-light bg-white p-6 sm:p-8">
          <h2 id="details-heading" className="text-[1.5rem] font-extrabold">
            Your details
          </h2>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3">
            <div>
              <dt className="font-semibold">Name</dt>
              <dd className="text-on-light-dim">{user.fullName}</dd>
            </div>
            <div>
              <dt className="font-semibold">Email</dt>
              <dd className="break-all text-on-light-dim">{user.email}</dd>
            </div>
            <div>
              <dt className="font-semibold">Signed in with</dt>
              <dd className="text-on-light-dim">{SIGN_IN_METHOD[user.signInMethod]}</dd>
            </div>
          </dl>
        </section>
      </Container>
    </>
  );
}
