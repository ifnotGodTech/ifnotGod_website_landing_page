import { describe, expect, it } from "vitest";
import { CHAT_MAX_MESSAGE_LENGTH, CHAT_MAX_REPLY_LENGTH, extractReply, parseChatRequest, parseInline, parseReply } from "./chat";

const sessionId = "3f2c9a1e-6b4d-4a8e-9f10-123456789abc";

describe("parseChatRequest", () => {
  it("accepts a message, trimmed", () => {
    expect(parseChatRequest({ sessionId, message: "  How much is Starter?  " })).toEqual({
      success: true,
      data: { sessionId, message: "How much is Starter?" },
    });
  });

  it("refuses an empty message", () => {
    expect(parseChatRequest({ sessionId, message: "   " })).toEqual({ success: false, error: "Type a message first." });
  });

  it("refuses a message over the limit", () => {
    const result = parseChatRequest({ sessionId, message: "a".repeat(CHAT_MAX_MESSAGE_LENGTH + 1) });
    expect(result.success).toBe(false);
  });

  it("refuses a missing or odd session id", () => {
    expect(parseChatRequest({ message: "Hi" }).success).toBe(false);
    expect(parseChatRequest({ sessionId: "short", message: "Hi" }).success).toBe(false);
    expect(parseChatRequest({ sessionId: "has spaces in it!", message: "Hi" }).success).toBe(false);
    expect(parseChatRequest(null).success).toBe(false);
  });
});

describe("extractReply", () => {
  it("reads n8n's output, text, or the first of several items", () => {
    expect(extractReply({ output: "Hello" })).toBe("Hello");
    expect(extractReply({ text: "Hello" })).toBe("Hello");
    expect(extractReply([{ output: "First" }, { output: "Second" }])).toBe("First");
  });

  it("returns nothing for an empty or unexpected answer", () => {
    expect(extractReply({ output: "  " })).toBeNull();
    expect(extractReply({ message: "Workflow was started" })).toBeNull();
    expect(extractReply(null)).toBeNull();
    expect(extractReply("Hello")).toBeNull();
  });

  it("cuts a very long reply", () => {
    const reply = extractReply({ output: "a".repeat(CHAT_MAX_REPLY_LENGTH + 50) });
    expect(reply).toHaveLength(CHAT_MAX_REPLY_LENGTH + 1);
    expect(reply?.endsWith("…")).toBe(true);
  });
});

describe("parseInline", () => {
  it("finds bold text, links and email addresses", () => {
    expect(parseInline("**Starter** is at https://www.ifnotgod.com/pricing. Email ifnotgodtech@gmail.com")).toEqual([
      { kind: "bold", text: "Starter" },
      { kind: "text", text: " is at " },
      { kind: "link", text: "https://www.ifnotgod.com/pricing", href: "https://www.ifnotgod.com/pricing" },
      { kind: "text", text: ". Email " },
      { kind: "link", text: "ifnotgodtech@gmail.com", href: "mailto:ifnotgodtech@gmail.com" },
    ]);
  });

  it("never makes a link from anything but http(s) addresses", () => {
    expect(parseInline("javascript:alert(1) <b>hi</b>")).toEqual([{ kind: "text", text: "javascript:alert(1) <b>hi</b>" }]);
  });
});

describe("parseReply", () => {
  it("splits paragraphs and lists", () => {
    const blocks = parseReply("Plans (monthly)\n- Starter — NGN 20,000\n- Growth — NGN 40,000\n\nNext step\n1) Book an audit");
    expect(blocks.map((block) => block.kind)).toEqual(["paragraph", "list", "paragraph", "list"]);
    expect(blocks[1]).toEqual({
      kind: "list",
      items: [[{ kind: "text", text: "Starter — NGN 20,000" }], [{ kind: "text", text: "Growth — NGN 40,000" }]],
    });
  });

  it("keeps line breaks inside a paragraph", () => {
    expect(parseReply("Line one\nLine two")).toEqual([
      { kind: "paragraph", lines: [[{ kind: "text", text: "Line one" }], [{ kind: "text", text: "Line two" }]] },
    ]);
  });
});
