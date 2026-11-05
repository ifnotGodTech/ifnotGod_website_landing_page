"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { NAV_LINKS } from "@/shared/constants";
import { Button } from "@/components/ui/Button";
import { cn } from "@/shared/cn";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-100 flex items-center justify-between px-5 py-4.5 transition-[background-color,border-color,padding] duration-300 sm:px-8 lg:px-16",
          scrolled ? "border-b border-line bg-ink/86 py-3.5 backdrop-blur-md" : "border-b border-transparent"
        )}
      >
        <a href="#top" className="flex items-center gap-2.5">
          <Image
            src="/ifnotgod-icon.png"
            alt="IFNOTGOD TECH LTD logo"
            width={1271}
            height={1237}
            priority
            className="h-9 w-9 object-contain"
          />
          <span className="font-display text-[1.02rem] font-semibold tracking-wide">
            IFNOTGOD TECH LTD
            <small className="mt-px block font-mono text-[0.58rem] font-normal tracking-[0.18em] text-mute">
              EVERY PROBLEM HAS A TECH SOLUTION
            </small>
          </span>
        </a>

        <div className="hidden items-center gap-8.5 xl:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-[0.74rem] uppercase tracking-[0.08em] text-paper-dim transition-colors hover:text-orange"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3.5">
          <div className="hidden xl:block">
            <Button href="#solutions" variant="ghost" size="sm">
              Explore Our Solutions
            </Button>
          </div>
          <div className="hidden lg:block">
            <Button href="#contact" size="sm">
              Tell Us Your Challenge
            </Button>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center text-paper xl:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? (
                <path d="M2 2l16 10M18 2 2 12" strokeLinecap="round" />
              ) : (
                <path d="M0 1h20M0 7h20M0 13h20" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "fixed inset-0 z-99 flex flex-col gap-6.5 bg-[#120b09] px-5 pb-10 pt-24 sm:px-8 lg:px-16 transition-opacity duration-200 xl:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="font-display text-[1.6rem]"
          >
            {link.label}
          </a>
        ))}
        <Button href="#contact" onClick={() => setOpen(false)} className="mt-3 w-fit">
          Tell Us Your Challenge
        </Button>
      </div>
    </>
  );
}
