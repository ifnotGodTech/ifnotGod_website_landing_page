import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { CATALOGUE_TAG } from "@/lib/catalogue/source";

// The backend calls this after the team saves site content, with the shared secret. It refreshes only the
// cached plans, services and home page text. The next visitor still gets the last good page while the new
// one builds ("max"), so a backend that's down at that moment never leaves a page empty.

function secretMatches(given: string | null): boolean {
  const expected = process.env.WEB_REFRESH_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!secretMatches(request.headers.get("x-refresh-secret"))) {
    return NextResponse.json({ refreshed: false }, { status: 401 });
  }
  revalidateTag(CATALOGUE_TAG, "max");
  return NextResponse.json({ refreshed: true });
}
