"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type SubmitEvent } from "react";
import { ChatReply } from "@/components/chat/ChatReply";
import type { useChatConversation } from "@/components/chat/useChatConversation";
import { CHAT_MAX_MESSAGE_LENGTH } from "@/shared/chat";
import { AUDIT_PATH, CONTACT_INFO } from "@/shared/constants";

type Conversation = ReturnType<typeof useChatConversation>;

type ChatPanelProps = {
  id: string;
  conversation: Conversation;
  onClose: () => void;
};

const WELCOME =
  "Hi! I'm the IFNOTGOD TECH assistant. Ask me about our services, plans and prices, or our free 20-minute automation audit.";

export function ChatPanel({ id, conversation, onClose }: ChatPanelProps) {
  const { ready, messages, status, error, send, startOver } = conversation;
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const sending = status === "sending";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages.length, sending, error]);

  async function submit(event?: SubmitEvent<HTMLFormElement>) {
    event?.preventDefault();
    const text = draft;
    if (!text.trim() || sending) return;
    setDraft("");
    const sent = await send(text);
    // On failure, give the message back so it can be sent again.
    if (!sent) setDraft((current) => current || text);
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <section
      id={id}
      role="dialog"
      aria-label="Chat with the IFNOTGOD TECH assistant"
      data-testid="chat-panel"
      className="fixed inset-x-4 bottom-21 z-95 flex max-h-[calc(100dvh-11.5rem)] flex-col overflow-hidden rounded-lg border border-line-strong bg-surface text-paper shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:inset-x-auto sm:right-8 sm:h-[34rem] sm:w-[24rem]"
    >
      <header className="flex items-center gap-3 border-b border-line bg-ink px-4 py-3">
        <Image src="/ifnotgod-icon.png" alt="" width={32} height={31} className="h-8 w-8 object-contain" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[0.95rem] leading-tight font-bold">IFNOTGOD TECH</p>
          <p className="truncate text-[0.72rem] text-paper-dim">AI assistant</p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={startOver}
            className="rounded-md px-2 py-1 text-[0.75rem] text-paper-dim hover:text-orange"
          >
            Start over
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the chat"
          className="flex h-9 w-9 items-center justify-center rounded-md text-paper-dim hover:text-orange"
        >
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div role="log" aria-live="polite" aria-label="Conversation" className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 text-[0.9rem] leading-relaxed">
        <div className="max-w-[88%] self-start rounded-lg rounded-tl-sm bg-surface-2 px-3.5 py-2.5">
          <p>{WELCOME}</p>
          <div className="mt-2.5 flex flex-wrap gap-2 text-[0.8rem]">
            <Link href={AUDIT_PATH} onClick={onClose} className="rounded-md border border-line-strong px-2.5 py-1 text-orange hover:border-orange">
              Book a free audit
            </Link>
            <a href={CONTACT_INFO.whatsappHref} target="_blank" rel="noopener noreferrer" className="rounded-md border border-line-strong px-2.5 py-1 text-orange hover:border-orange">
              WhatsApp us
            </a>
          </div>
        </div>

        {messages.map((message, index) =>
          message.role === "visitor" ? (
            <div key={index} className="max-w-[85%] self-end rounded-lg rounded-tr-sm bg-maroon px-3.5 py-2.5 whitespace-pre-wrap break-words">
              <span className="sr-only">You: </span>
              {message.text}
            </div>
          ) : (
            <div key={index} className="max-w-[88%] self-start rounded-lg rounded-tl-sm bg-surface-2 px-3.5 py-2.5 break-words">
              <span className="sr-only">Assistant: </span>
              <ChatReply text={message.text} />
            </div>
          )
        )}

        {sending && (
          <div className="self-start rounded-lg rounded-tl-sm bg-surface-2 px-3.5 py-2.5 text-paper-dim" data-testid="chat-thinking">
            Thinking…
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-md border border-orange/40 bg-orange-soft px-3 py-2 text-[0.82rem]">
            {error}
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-line bg-ink px-3 py-3">
        <label htmlFor={`${id}-input`} className="sr-only">
          Your message
        </label>
        <textarea
          ref={inputRef}
          id={`${id}-input`}
          rows={1}
          value={draft}
          maxLength={CHAT_MAX_MESSAGE_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about our services or prices…"
          disabled={!ready}
          className="max-h-28 min-h-11 flex-1 resize-none rounded-md border border-line-strong bg-surface px-3 py-2.5 text-[0.9rem] text-paper placeholder:text-mute"
        />
        <button
          type="submit"
          disabled={!ready || sending || !draft.trim()}
          className="h-11 rounded-md bg-maroon px-4 text-[0.85rem] font-semibold text-paper transition-colors hover:bg-maroon-bright disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
      <p className="bg-ink px-4 pb-2.5 text-[0.68rem] text-mute">
        AI answers can be wrong. Please don&apos;t share passwords or card details. See our{" "}
        <Link href="/privacy-policy" className="underline hover:text-orange" onClick={onClose}>
          Privacy Policy
        </Link>
        .
      </p>
    </section>
  );
}
