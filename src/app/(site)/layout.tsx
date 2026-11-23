import type { ReactNode } from "react";
import { ChatAssistant } from "@/components/chat/ChatAssistant";
import { Footer } from "@/components/sections/Footer";
import { Navigation } from "@/components/sections/Navigation";
import { FloatingCta } from "@/components/ui/FloatingCta";
import { CHAT_ENABLED } from "@/shared/features";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingCta besideChat={CHAT_ENABLED} />
      {CHAT_ENABLED && <ChatAssistant />}
    </>
  );
}
