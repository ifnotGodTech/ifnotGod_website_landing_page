import type { ReactNode } from "react";
import { Footer } from "@/components/sections/Footer";
import { Navigation } from "@/components/sections/Navigation";
import { FloatingCta } from "@/components/ui/FloatingCta";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingCta />
    </>
  );
}
