"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/shared/cn";
import { AUDIT_PATH, CONTACT_INFO } from "@/shared/constants";

// These areas have their own calls to action, and the button would cover them.
// A page opts its hero in with the data-page-hero attribute.
const HIDE_OVER = "[data-page-hero], footer";

// The audit page is the button's destination. On legal pages it would cover text being read,
// and on sign-in pages it would distract from the form.
const HIDDEN_ON: readonly string[] = [AUDIT_PATH, "/privacy-policy", "/terms", "/login", "/signup", "/reset-password"];

export function FloatingCta() {
  const [clearOfCtas, setClearOfCtas] = useState(false);
  const pathname = usePathname();
  const visible = clearOfCtas && !HIDDEN_ON.includes(pathname);

  // This component stays mounted between pages, so watch the new page's areas on each change.
  useEffect(() => {
    const inView = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target);
        else inView.delete(entry.target);
      }
      setClearOfCtas(inView.size === 0);
    });

    document.querySelectorAll(HIDE_OVER).forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div
      data-testid="floating-cta"
      className={cn(
        "fixed right-4 bottom-6.5 z-90 flex items-center gap-2.5 transition-[opacity,visibility] duration-200 sm:right-8",
        visible ? "visible opacity-100" : "invisible opacity-0"
      )}
    >
      <a
        href={CONTACT_INFO.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-11 w-11 items-center justify-center rounded-md border border-orange bg-ink text-orange shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-colors hover:bg-orange hover:text-ink xl:hidden"
      >
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
      <Button href={AUDIT_PATH} size="sm" className="shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        Book a free audit
      </Button>
    </div>
  );
}
