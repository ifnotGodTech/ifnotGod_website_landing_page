import { NextResponse, type NextRequest } from "next/server";
import { authorizeUrl, GOOGLE_COOKIE, GOOGLE_COOKIE_MAX_AGE, googleClientId, newAttempt, sealAttempt } from "@/lib/accounts/google";
import { loginWithError, safeNextPath } from "@/lib/accounts/paths";
import { cookieSecret } from "@/lib/accounts/signing";
import { ACCOUNTS_ENABLED } from "@/shared/features";

// Starts Google sign-in: sends the visitor to Google, remembering the attempt in a short-lived cookie.
export async function GET(request: NextRequest) {
  if (!ACCOUNTS_ENABLED) return new NextResponse(null, { status: 404 });

  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const clientId = googleClientId();
  if (!clientId) {
    console.error("[accounts] Google sign-in isn't configured: set GOOGLE_CLIENT_ID");
    return NextResponse.redirect(new URL(loginWithError(next, "google"), request.url));
  }

  const attempt = newAttempt(next);
  const response = NextResponse.redirect(authorizeUrl(clientId, request.nextUrl.origin, attempt));
  response.cookies.set(GOOGLE_COOKIE, sealAttempt(attempt, cookieSecret()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax, so the cookie comes back when Google redirects to the callback.
    sameSite: "lax",
    path: "/login/google",
    maxAge: GOOGLE_COOKIE_MAX_AGE,
  });
  return response;
}
