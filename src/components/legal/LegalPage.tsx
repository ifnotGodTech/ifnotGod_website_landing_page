import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { LEGAL_INFO } from "@/shared/constants";

type LegalPageProps = {
  title: string;
  intro: ReactNode;
  children: ReactNode;
};

export function LegalPage({ title, intro, children }: LegalPageProps) {
  return (
    <Container width="narrow" className="pb-14 pt-28 sm:pb-20 sm:pt-36">
      <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] font-bold">{title}</h1>
      <p className="mt-4 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-mute">
        Last updated: {LEGAL_INFO.lastUpdated}
      </p>
      <div className="mt-7 text-[1.08rem] text-paper-dim">{intro}</div>
      <div className="mt-12 flex flex-col gap-11">{children}</div>
    </Container>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 border-t border-line pt-9 text-paper-dim [&_a]:text-orange [&_a]:underline [&_strong]:font-semibold [&_strong]:text-paper [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2.5 [&_ul]:pl-5">
      <h2 className="text-[1.45rem] font-semibold">{title}</h2>
      {children}
    </section>
  );
}
