import { extractReply, type ChatRequest } from "@/shared/chat";

// The one route to the AI assistant: our n8n workflow's chat trigger ("When chat message received",
// Embedded Chat mode). Only this server calls it, so its address stays out of the browser and n8n's
// allowed-origins setting doesn't apply. n8n keeps each conversation's memory by sessionId.

/** n8n's AI agent can take a while, and Render-style cold starts don't apply, so 60 seconds is ample. */
export const CHAT_TIMEOUT_MS = 60_000;

export type ChatReply =
  | { ok: true; reply: string }
  | { ok: false; reason: "not-configured" | "timeout" | "unavailable" | "bad-reply" };

export function chatUrl(): string | null {
  return process.env.N8N_CHAT_URL || null;
}

export async function askAssistant({ sessionId, message }: ChatRequest): Promise<ChatReply> {
  const url = chatUrl();
  if (!url) return { ok: false, reason: "not-configured" };

  const headers: Record<string, string> = { "content-type": "application/json", accept: "application/json" };
  // If the chat trigger is set to Basic Auth, N8N_CHAT_AUTH holds "user:password".
  const auth = process.env.N8N_CHAT_AUTH;
  if (auth) headers.authorization = `Basic ${Buffer.from(auth).toString("base64")}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ action: "sendMessage", sessionId, chatInput: message }),
      signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    // Never log the message itself: visitors may type personal details.
    console.error(`[chat] n8n request failed: ${timedOut ? "timeout" : "network error"}`);
    return { ok: false, reason: timedOut ? "timeout" : "unavailable" };
  }

  if (!response.ok) {
    console.error(`[chat] n8n answered ${response.status}`);
    return { ok: false, reason: "unavailable" };
  }

  const reply = extractReply(await response.json().catch(() => null));
  if (!reply) {
    console.error("[chat] n8n's answer had no reply text");
    return { ok: false, reason: "bad-reply" };
  }
  return { ok: true, reply };
}
