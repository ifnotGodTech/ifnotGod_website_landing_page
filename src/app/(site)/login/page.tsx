import { notFound, redirect } from "next/navigation";
import { LogInForm } from "@/components/account/AuthForms";
import { AuthLink, AuthShell } from "@/components/account/AuthShell";
import { getCurrentUser } from "@/lib/accounts";
import { logInAction } from "@/lib/accounts/actions";
import { safeNextPath, withNext } from "@/lib/accounts/paths";
import { AUDIT_PATH } from "@/shared/constants";
import { ACCOUNTS_ENABLED } from "@/shared/features";
import { buildPageMetadata } from "@/shared/metadata";

export const metadata = buildPageMetadata({
  title: "Log in | IFNOTGOD TECH LTD",
  description: "Log in to subscribe or manage your IFNOTGOD TECH plan.",
  path: "/login",
  index: false,
});

export default async function LogInPage({ searchParams }: PageProps<"/login">) {
  if (!ACCOUNTS_ENABLED) notFound();
  const next = safeNextPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthShell
      title="Welcome back"
      intro="Log in to subscribe or manage your plan."
      after={
        <>
          <p>
            New here? <AuthLink href={withNext("/signup", next)}>Create an account</AuthLink>
          </p>
          <p className="text-[0.94rem]">
            Just exploring? You don&apos;t need an account to <AuthLink href={AUDIT_PATH}>book a free audit</AuthLink>.
          </p>
        </>
      }
    >
      <LogInForm action={logInAction} next={next} />
    </AuthShell>
  );
}
