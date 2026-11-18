import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AccountHeader } from "@/components/account/AccountHeader";
import { Footer } from "@/components/sections/Footer";
import { ACCOUNTS_ENABLED } from "@/shared/features";

// Separate from the public (site) pages, which must never read the session.
export default function AccountLayout({ children }: { children: ReactNode }) {
  if (!ACCOUNTS_ENABLED) notFound();

  return (
    <>
      <AccountHeader />
      <main className="surface-light flex-1">{children}</main>
      <Footer />
    </>
  );
}
