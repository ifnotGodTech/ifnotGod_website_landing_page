import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type AccountBandProps = {
  title: string;
  intro?: ReactNode;
  /** Shows "Back to your account" above the title. */
  back?: boolean;
};

/** The dark band at the top of each account page. */
export function AccountBand({ title, intro, back }: AccountBandProps) {
  return (
    <div className="surface-dark">
      <Container className="flex flex-col gap-2 pb-12 pt-10">
        {back && (
          <Link href="/account" className="w-fit font-semibold text-orange underline hover:text-paper">
            Back to your account
          </Link>
        )}
        <h1 className="text-[clamp(2.1rem,4.5vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">{title}</h1>
        {intro && <div className="max-w-[40em] text-[1.1rem] text-paper-dim">{intro}</div>}
      </Container>
    </div>
  );
}
