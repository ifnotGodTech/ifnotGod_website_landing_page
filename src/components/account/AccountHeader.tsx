import Image from "next/image";
import Link from "next/link";
import { logOutAction } from "@/lib/accounts/actions";
import { Container } from "@/components/ui/Container";

const LINK = "text-[0.94rem] text-paper-dim transition-colors hover:text-orange";

export function AccountHeader() {
  return (
    <header className="border-b border-line bg-ink">
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4.5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/ifnotgod-icon.png" alt="IFNOTGOD TECH LTD logo" width={36} height={35} className="h-9 w-9 object-contain" />
          <span className="font-display text-[1.02rem] font-bold tracking-wide">IFNOTGOD TECH LTD</span>
        </Link>
        <nav aria-label="Account" className="flex flex-wrap items-center gap-x-7 gap-y-2">
          <Link href="/pricing" className={LINK}>
            Pricing
          </Link>
          <Link href="/account" className={LINK}>
            Your account
          </Link>
          <form action={logOutAction}>
            <button type="submit" className={`${LINK} cursor-pointer`}>
              Log out
            </button>
          </form>
        </nav>
      </Container>
    </header>
  );
}
