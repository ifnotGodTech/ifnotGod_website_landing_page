import { NextRequest, NextResponse } from "next/server";
import { askAssistant } from "@/lib/chat/n8n";
import { createRateLimiter } from "@/lib/rateLimit";
import { clientIp, isCrossOrigin, isJson, isTooLarge } from "@/lib/requestGuards";
import { parseChatRequest } from "@/shared/chat";
import { CHAT_ENABLED } from "@/shared/features";

// The AI assistant's replies can take a while.
export const maxDuration = 70;

// Per visitor address: a quick burst, and an hourly cap. People chatting rarely send more than a
// message every few seconds; this mainly stops scripts running up the AI bill.
const burstLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 8, maxTrackedKeys: 10_000 });
const hourlyLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 60, maxTrackedKeys: 10_000 });

const MAX_BODY_BYTES = 8 * 1024;

const UNAVAILABLE =
  "The assistant isn't available right now. Please try again in a moment, or reach us on WhatsApp.";

function fail(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!CHAT_ENABLED) return fail(404, "Not found.");
  if (isCrossOrigin(request)) return fail(403, "Request not allowed.");
  if (!isJson(request)) return fail(415, "Unsupported request format.");
  if (isTooLarge(request, MAX_BODY_BYTES)) return fail(413, "Your message is too long.");

  const ip = clientIp(request);
  // Both are checked, so each counts every message.
  const limited = [burstLimiter.isLimited(ip), hourlyLimiter.isLimited(ip)].some(Boolean);
  if (limited) return fail(429, "You're sending messages too quickly. Please wait a minute and try again.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Invalid request.");
  }

  const parsed = parseChatRequest(body);
  if (!parsed.success) return fail(400, parsed.error);

  const answer = await askAssistant(parsed.data);
  if (answer.ok) {
    return NextResponse.json({ ok: true, reply: answer.reply }, { headers: { "Cache-Control": "no-store" } });
  }
  if (answer.reason === "timeout") {
    return fail(504, "The assistant is taking too long to answer. Please try again, or reach us on WhatsApp.");
  }
  return fail(answer.reason === "not-configured" ? 503 : 502, UNAVAILABLE);
}
