import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type AuthShellProps = {
  title: string;
  intro: string;
  children: ReactNode;
  /** Links shown under the card, such as "Already have an account?". */
  after?: ReactNode;
};

export function AuthShell({ title, intro, children, after }: AuthShellProps) {
  return (
    <Container width="narrow" className="flex max-w-[480px] flex-col gap-6 pb-22 pt-[clamp(120px,14vw,150px)]">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-[clamp(2rem,4vw,2.6rem)] font-extrabold leading-[1.1] tracking-[-0.025em]">{title}</h1>
        <p className="text-paper-dim">{intro}</p>
      </div>
      {children}
      {after && <div className="flex flex-col gap-3 text-center text-paper-dim">{after}</div>}
    </Container>
  );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="font-semibold text-orange underline transition-colors hover:text-paper">
      {children}
    </a>
  );
}
