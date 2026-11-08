import { notFound } from "next/navigation";
import { ResetPasswordForm } from "@/components/account/AuthForms";
import { AuthLink, AuthShell } from "@/components/account/AuthShell";
import { resetPasswordAction } from "@/lib/accounts/actions";
import { ACCOUNTS_ENABLED } from "@/shared/features";
import { buildPageMetadata } from "@/shared/metadata";

export const metadata = buildPageMetadata({
  title: "Reset your password | IFNOTGOD TECH LTD",
  description: "Get a link to reset your IFNOTGOD TECH account password.",
  path: "/reset-password",
  index: false,
});

export default function ResetPasswordPage() {
  if (!ACCOUNTS_ENABLED) notFound();

  return (
    <AuthShell
      title="Reset your password"
      intro="Enter your email and we'll send you a link to set a new password."
      after={<AuthLink href="/login">Back to log in</AuthLink>}
    >
      <ResetPasswordForm action={resetPasswordAction} />
    </AuthShell>
  );
}
