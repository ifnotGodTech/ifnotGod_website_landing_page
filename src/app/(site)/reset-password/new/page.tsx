import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SetPasswordForm } from "@/components/account/AuthForms";
import { AuthLink, AuthShell } from "@/components/account/AuthShell";
import { setNewPasswordAction } from "@/lib/accounts/actions";
import { ACCOUNTS_ENABLED } from "@/shared/features";
import { buildPageMetadata } from "@/shared/metadata";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Set a new password | IFNOTGOD TECH LTD",
    description: "Set a new password for your IFNOTGOD TECH account.",
    path: "/reset-password/new",
    index: false,
  }),
  // The address holds the reset link's token, so it's never sent on to another site.
  referrer: "no-referrer",
};

export default async function SetPasswordPage({ searchParams }: PageProps<"/reset-password/new">) {
  if (!ACCOUNTS_ENABLED) notFound();
  const { uid, token } = await searchParams;
  const complete = typeof uid === "string" && uid !== "" && typeof token === "string" && token !== "";

  return (
    <AuthShell
      title={complete ? "Set a new password" : "This link isn't complete"}
      intro={
        complete
          ? "Choose a new password for your account."
          : "Open the link from your email again, or ask for a new one."
      }
      after={<AuthLink href="/reset-password">Ask for a new link</AuthLink>}
    >
      {complete && <SetPasswordForm action={setNewPasswordAction} uid={uid} token={token} />}
    </AuthShell>
  );
}
