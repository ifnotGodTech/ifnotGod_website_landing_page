// Rules for the AI assistant chat, shared by the chat window and the /api/chat route.

export const CHAT_MAX_MESSAGE_LENGTH = 1000;
/** Longer replies are cut, so a misbehaving workflow can't flood the page. */
export const CHAT_MAX_REPLY_LENGTH = 8000;
/** Messages kept in the window (and in the tab's storage). Older ones drop off the top. */
export const CHAT_MAX_SHOWN_MESSAGES = 60;

const SESSION_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

export type ChatRole = "visitor" | "assistant";
export type ChatMessage = { role: ChatRole; text: string };

export type ChatRequest = { sessionId: string; message: string };

export type ParsedChatRequest = { success: true; data: ChatRequest } | { success: false; error: string };

export function parseChatRequest(body: unknown): ParsedChatRequest {
  if (typeof body !== "object" || body === null) return { success: false, error: "Invalid request." };
  const { sessionId, message } = body as Record<string, unknown>;

  if (typeof sessionId !== "string" || !SESSION_ID_PATTERN.test(sessionId)) {
    return { success: false, error: "Invalid request." };
  }
  if (typeof message !== "string" || message.trim() === "") {
    return { success: false, error: "Type a message first." };
  }
  if (message.length > CHAT_MAX_MESSAGE_LENGTH) {
    return { success: false, error: `Keep your message under ${CHAT_MAX_MESSAGE_LENGTH} characters.` };
  }
  return { success: true, data: { sessionId, message: message.trim() } };
}

/**
 * The reply text from n8n's chat webhook. It answers { output } by default, sometimes { text }, and an
 * array of those when the workflow ends with several items.
 */
export function extractReply(payload: unknown): string | null {
  const item = Array.isArray(payload) ? payload[0] : payload;
  if (typeof item !== "object" || item === null) return null;
  const { output, text } = item as Record<string, unknown>;
  const reply = typeof output === "string" ? output : typeof text === "string" ? text : null;
  if (!reply || reply.trim() === "") return null;
  return reply.length > CHAT_MAX_REPLY_LENGTH ? `${reply.slice(0, CHAT_MAX_REPLY_LENGTH)}…` : reply.trim();
}

// Replies are written in light Markdown: paragraphs, "- " or "1) " lists and **bold**. They're shown as
// text, never as HTML, with web addresses and email addresses made into links.

export type InlinePart =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "link"; text: string; href: string };

export type ReplyBlock = { kind: "paragraph"; lines: InlinePart[][] } | { kind: "list"; items: InlinePart[][] };

const LIST_ITEM = /^\s*(?:[-*•]|\d+[.)])\s+/;
const LINK_OR_EMAIL = /(https?:\/\/[^\s<>()]+[^\s<>().,!?;:'"])|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

function linkify(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_OR_EMAIL)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ kind: "text", text: text.slice(last, index) });
    const [found, url, email] = match;
    parts.push(url ? { kind: "link", text: url, href: url } : { kind: "link", text: email, href: `mailto:${email}` });
    last = index + found.length;
  }
  if (last < text.length) parts.push({ kind: "text", text: text.slice(last) });
  return parts;
}

export function parseInline(line: string): InlinePart[] {
  const parts: InlinePart[] = [];
  line.split(/(\*\*[^*]+\*\*)/).forEach((piece) => {
    if (!piece) return;
    if (piece.startsWith("**") && piece.endsWith("**") && piece.length > 4) {
      parts.push({ kind: "bold", text: piece.slice(2, -2) });
    } else {
      parts.push(...linkify(piece));
    }
  });
  return parts;
}

export function parseReply(reply: string): ReplyBlock[] {
  const blocks: ReplyBlock[] = [];
  for (const chunk of reply.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");
    let paragraph: InlinePart[][] = [];
    let list: InlinePart[][] = [];

    const flush = () => {
      if (paragraph.length) blocks.push({ kind: "paragraph", lines: paragraph });
      if (list.length) blocks.push({ kind: "list", items: list });
      paragraph = [];
      list = [];
    };

    for (const line of lines) {
      if (LIST_ITEM.test(line)) {
        if (paragraph.length) {
          blocks.push({ kind: "paragraph", lines: paragraph });
          paragraph = [];
        }
        list.push(parseInline(line.replace(LIST_ITEM, "").trim()));
      } else {
        if (list.length) {
          blocks.push({ kind: "list", items: list });
          list = [];
        }
        paragraph.push(parseInline(line.trim()));
      }
    }
    flush();
  }
  return blocks;
}
