import { notFound, redirect } from "next/navigation";
import { SignUpForm } from "@/components/account/AuthForms";
import { AuthLink, AuthShell } from "@/components/account/AuthShell";
import { getCurrentUser } from "@/lib/accounts";
import { signUpAction } from "@/lib/accounts/actions";
import { safeNextPath, withNext } from "@/lib/accounts/paths";
import { ACCOUNTS_ENABLED } from "@/shared/features";
import { buildPageMetadata } from "@/shared/metadata";

export const metadata = buildPageMetadata({
  title: "Create your account | IFNOTGOD TECH LTD",
  description: "Create an IFNOTGOD TECH account to subscribe to a plan.",
  path: "/signup",
  index: false,
});

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  if (!ACCOUNTS_ENABLED) notFound();
  const next = safeNextPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthShell
      title="Create your account"
      intro="You'll choose your plan and pay after this."
      after={
        <p>
          Already have an account? <AuthLink href={withNext("/login", next)}>Log in</AuthLink>
        </p>
      }
    >
      <SignUpForm action={signUpAction} next={next} />
    </AuthShell>
  );
}
