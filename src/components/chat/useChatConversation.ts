"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHAT_MAX_SHOWN_MESSAGES, type ChatMessage } from "@/shared/chat";

// One conversation per browser tab. Its id tells n8n whose memory to use, and the messages are kept in
// the tab's sessionStorage, so they survive moving between pages and reloads, and go when the tab closes.
// Nothing here is a cookie, and nothing is sent anywhere but this site's /api/chat.

const STORAGE_KEY = "ifng_chat";
/** A little longer than the server's own wait for n8n. */
const CLIENT_TIMEOUT_MS = 75_000;

export type ChatStatus = "idle" | "sending" | "error";

type Stored = { sessionId: string; messages: ChatMessage[] };

function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function load(): Stored | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Stored;
    if (typeof stored.sessionId !== "string" || !Array.isArray(stored.messages)) return null;
    return stored;
  } catch {
    return null;
  }
}

function save(stored: Stored) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage can be blocked or full. The conversation still works; it just won't survive a reload.
  }
}

export function useChatConversation() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  // Storage is read when the chat is first opened, in the browser, so the server's page always matches.
  const resume = useCallback(() => {
    if (sessionId) return;
    const stored = load();
    setSessionId(stored?.sessionId ?? newSessionId());
    if (stored) setMessages(stored.messages);
  }, [sessionId]);

  useEffect(() => () => inFlight.current?.abort(), []);

  useEffect(() => {
    if (sessionId) save({ sessionId, messages });
  }, [sessionId, messages]);

  const send = useCallback(
    async (text: string): Promise<boolean> => {
      const message = text.trim();
      if (!message || !sessionId || inFlight.current) return false;

      const controller = new AbortController();
      inFlight.current = controller;
      const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
      setStatus("sending");
      setError(null);
      setMessages((current) => [...current, { role: "visitor" as const, text: message }].slice(-CHAT_MAX_SHOWN_MESSAGES));

      let failure: string | null = null;
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId, message }),
          signal: controller.signal,
        });
        const body = (await response.json().catch(() => null)) as { ok?: boolean; reply?: string; error?: string } | null;
        if (response.ok && body?.ok && body.reply) {
          const reply = body.reply;
          setMessages((current) => [...current, { role: "assistant" as const, text: reply }].slice(-CHAT_MAX_SHOWN_MESSAGES));
        } else {
          failure = body?.error ?? "Something went wrong. Please try again.";
        }
      } catch {
        failure = controller.signal.aborted
          ? "The assistant is taking too long to answer. Please try again."
          : "We couldn't reach the assistant. Check your connection and try again.";
      } finally {
        clearTimeout(timer);
        inFlight.current = null;
      }

      if (failure) {
        // Take the unanswered message back out, so the visitor can retry it from the box.
        setMessages((current) => current.slice(0, -1));
        setStatus("error");
        setError(failure);
        return false;
      }
      setStatus("idle");
      return true;
    },
    [sessionId]
  );

  const startOver = useCallback(() => {
    inFlight.current?.abort();
    setMessages([]);
    setStatus("idle");
    setError(null);
    setSessionId(newSessionId());
  }, []);

  return { ready: sessionId !== null, messages, status, error, resume, send, startOver };
}
