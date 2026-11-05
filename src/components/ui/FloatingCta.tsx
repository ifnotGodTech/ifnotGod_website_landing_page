"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/shared/cn";

// These areas have their own calls to action, and the button would cover them.
const HIDE_OVER = "#top, #contact, footer";

export function FloatingCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const inView = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target);
        else inView.delete(entry.target);
      }
      setVisible(inView.size === 0);
    });

    document.querySelectorAll(HIDE_OVER).forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-testid="floating-cta"
      className={cn(
        "fixed right-4 bottom-6.5 z-90 transition-[opacity,visibility] duration-200 sm:right-8",
        visible ? "visible opacity-100" : "invisible opacity-0"
      )}
    >
      <Button href="#contact" size="sm" className="shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        Let&apos;s Solve Your Problem
      </Button>
    </div>
  );
}
