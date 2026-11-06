import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/sections/Footer";
import { LEGAL_INFO } from "@/shared/constants";

type LegalPageProps = {
  title: string;
  intro: ReactNode;
  children: ReactNode;
};

const CONTAINER = "mx-auto w-full max-w-[860px] px-5 sm:px-8";

export function LegalPage({ title, intro, children }: LegalPageProps) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-[860px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/ifnotgod-icon.png" alt="" width={36} height={35} className="h-9 w-9 object-contain" />
            <span className="font-display text-[1.02rem] font-bold tracking-wide">IFNOTGOD TECH LTD</span>
          </Link>
          <Link href="/" className="whitespace-nowrap text-[0.9rem] text-paper-dim transition-colors hover:text-orange">
            Back to home
          </Link>
        </div>
      </header>

      <main className={`${CONTAINER} py-14 sm:py-20`}>
        <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] font-bold">{title}</h1>
        <p className="mt-4 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-mute">
          Last updated: {LEGAL_INFO.lastUpdated}
        </p>
        <div className="mt-7 text-[1.08rem] text-paper-dim">{intro}</div>
        <div className="mt-12 flex flex-col gap-11">{children}</div>
      </main>

      <Footer />
    </>
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
