import type { NextRequest } from "next/server";

// Checks shared by the route handlers that browsers on this site post to.

/** A browser request from another site. Requests without an Origin header (not browsers) pass. */
export function isCrossOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

/** The visitor's address. Vercel overwrites x-forwarded-for, so visitors can't fake it. */
export function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function isJson(request: NextRequest): boolean {
  return Boolean(request.headers.get("content-type")?.toLowerCase().startsWith("application/json"));
}

export function isTooLarge(request: NextRequest, maxBytes: number): boolean {
  return Number(request.headers.get("content-length") ?? 0) > maxBytes;
}
