import { NextRequest, NextResponse } from "next/server";
import { parseContactSubmission } from "@/shared/validators/contact";
import { sendContactNotification, EmailNotConfiguredError } from "@/lib/notifications/email";
import { HONEYPOT_FIELD } from "@/shared/constants";

// Simple in-memory rate limit: 5 submissions per IP per 10 minutes.
// Resets on server restart/redeploy — sufficient to blunt naive spam bots,
// not a substitute for a durable rate limiter if abuse becomes a real problem.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(key, timestamps);
  return timestamps.length > MAX_REQUESTS_PER_WINDOW;
}

// Comfortably above the validator's limits on all fields combined.
const MAX_BODY_BYTES = 32 * 1024;

function isCrossOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

function isHoneypotFilled(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  return Boolean((body as Record<string, unknown>)[HONEYPOT_FIELD]);
}

export async function POST(request: NextRequest) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Request not allowed." }, { status: 403 });
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ ok: false, error: "Unsupported request format." }, { status: 415 });
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Your message is too long." }, { status: 413 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  // Report success so bots get no signal to adapt to, but don't deliver anything.
  if (isHoneypotFilled(body)) {
    return NextResponse.json({ ok: true });
  }

  const result = parseContactSubmission(body);
  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });
  }

  try {
    await sendContactNotification(result.data);
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "The contact form isn't fully connected yet — your message wasn't delivered. Please reach us on WhatsApp or email in the meantime.",
        },
        { status: 503 }
      );
    }

    console.error("[contact] failed to deliver submission", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong sending your message. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
