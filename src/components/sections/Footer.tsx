import Image from "next/image";
import type { ReactNode } from "react";
import { SOCIAL_LINKS } from "@/shared/constants";

const COMPANY_LINKS = [
  { label: "Solutions", href: "#solutions" },
  { label: "How We Work", href: "#how-we-work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms", href: "#" },
];

export function Footer() {
  return (
    <footer
      className="border-t border-line py-14 pb-9"
      style={{ background: "radial-gradient(ellipse 600px 300px at 0% 100%, rgba(107,31,42,0.24), transparent 60%)" }}
    >
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src="/ifnotgod-icon.png"
              alt="IFNOTGOD TECH LTD logo"
              width={1271}
              height={1237}
              className="h-7.5 w-7.5 object-contain"
            />
            <span className="font-display text-[1.02rem] font-semibold">IFNOTGOD TECH LTD</span>
          </div>
          <p className="mt-3.5 max-w-[30ch] text-[0.88rem] text-mute">&quot;Every problem has a tech solution.&quot;</p>
        </div>

        <FooterColumn heading="Company" links={COMPANY_LINKS} />
        <FooterColumn heading="Legal" links={LEGAL_LINKS} />

        <div>
          <h4 className="mb-4.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-mute">Connect</h4>
          <div className="flex gap-3.5">
            <SocialIcon href={SOCIAL_LINKS.linkedin} label="LinkedIn">
              <rect x="3" y="9" width="4" height="12" />
              <circle cx="5" cy="4" r="2" />
              <path d="M11 21v-7a3 3 0 0 1 6 0v7M11 12v9" />
            </SocialIcon>
            <SocialIcon href={SOCIAL_LINKS.x} label="X">
              <path d="M4 4l16 16M20 4 4 20" />
            </SocialIcon>
            <SocialIcon href={SOCIAL_LINKS.instagram} label="Instagram">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
            </SocialIcon>
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-[0.8rem] text-mute">
        <span>© 2026 IFNOTGOD TECH LTD. All rights reserved.</span>
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.08em]">Every problem has a tech solution.</span>
      </div>
    </footer>
  );
}

function FooterColumn({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="mb-4.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-mute">{heading}</h4>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="block py-1.5 text-[0.92rem] text-paper-dim transition-colors hover:text-orange"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-line-strong text-paper-dim transition-colors hover:border-orange hover:text-orange"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        {children}
      </svg>
    </a>
  );
}
