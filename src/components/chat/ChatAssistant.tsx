"use client";

import { useEffect, useRef, useState } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useChatConversation } from "@/components/chat/useChatConversation";

// The AI assistant's floating button, at the bottom right of every public page, and its chat window.
// It stays mounted between pages (it's in the shared layout), so the conversation carries on.

const PANEL_ID = "chat-assistant";

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const conversation = useChatConversation();
  const launcherRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {open && <ChatPanel id={PANEL_ID} conversation={conversation} onClose={close} />}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => {
          if (open) return close();
          conversation.resume();
          setOpen(true);
        }}
        aria-expanded={open}
        aria-controls={open ? PANEL_ID : undefined}
        aria-label={open ? "Close the chat" : "Chat with our assistant"}
        data-testid="chat-launcher"
        className="fixed right-4 bottom-6.5 z-95 flex h-11 w-11 items-center justify-center rounded-md border border-orange bg-maroon text-paper shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-colors hover:bg-maroon-bright sm:right-8"
      >
        {open ? (
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v8a2.5 2.5 0 01-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 014 14.5z" strokeLinejoin="round" />
            <path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" strokeLinecap="round" strokeWidth="2.4" />
          </svg>
        )}
      </button>
    </>
  );
}
