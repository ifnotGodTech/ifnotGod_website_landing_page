import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { requireUser } from "@/lib/accounts";
import { buildPageMetadata } from "@/shared/metadata";

export const metadata = buildPageMetadata({
  title: "Your account | IFNOTGOD TECH LTD",
  description: "Your IFNOTGOD TECH plan, payments and details.",
  path: "/account",
  index: false,
});

const SIGN_IN_METHOD = { password: "Email and password", google: "Google" } as const;

// Phase 11 adds the subscription, services and payments from the mock.
export default async function AccountPage() {
  const user = await requireUser("/account");
  const firstName = user.fullName.split(" ")[0];

  return (
    <>
      <div className="surface-dark">
        <Container className="flex flex-col gap-1.5 pb-14 pt-10">
          <h1 className="text-[clamp(2.1rem,4.5vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Hello, {firstName}
          </h1>
          <p className="text-[1.15rem] text-paper-dim">
            {user.businessName ? `${user.businessName} · ` : ""}
            {user.email}
          </p>
        </Container>
      </div>

      <Container className="flex flex-col gap-7 pb-22 pt-10">
        <section aria-labelledby="plan-heading" className="flex flex-col items-start gap-3 rounded-xl border border-line-light bg-white p-7">
          <h2 id="plan-heading" className="text-[1.5rem] font-extrabold">
            Your plan
          </h2>
          <p className="text-on-light-dim">You haven&apos;t subscribed yet. Choose a plan to get started.</p>
          <Link href="/pricing" className="rounded-md bg-maroon px-5 py-3 font-bold text-paper hover:bg-maroon-bright">
            See plans
          </Link>
        </section>

        <section aria-labelledby="details-heading" className="flex flex-col gap-3 rounded-xl border border-line-light bg-white p-7">
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
