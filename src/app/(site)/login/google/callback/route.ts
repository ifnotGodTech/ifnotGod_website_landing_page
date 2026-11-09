import { NextResponse, type NextRequest } from "next/server";
import { signInWithGoogle } from "@/lib/accounts/api";
import { callbackUrl, GOOGLE_COOKIE, openAttempt } from "@/lib/accounts/google";
import { ACCOUNT_HOME, loginWithError } from "@/lib/accounts/paths";
import { startSession } from "@/lib/accounts/session";
import { cookieSecret } from "@/lib/accounts/signing";
import { ACCOUNTS_ENABLED } from "@/shared/features";

/** Back to log in with a plain message, keeping where they were going. */
function failed(request: NextRequest, next: string) {
  const response = NextResponse.redirect(new URL(loginWithError(next, "google"), request.url));
  response.cookies.delete({ name: GOOGLE_COOKIE, path: "/login/google" });
  return response;
}

// Google sends the visitor back here with a one-time code. The state must match the attempt this
// browser started, so nobody can finish someone else's sign-in.
export async function GET(request: NextRequest) {
  if (!ACCOUNTS_ENABLED) return new NextResponse(null, { status: 404 });

  const attempt = openAttempt(request.cookies.get(GOOGLE_COOKIE)?.value, cookieSecret());
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  if (!attempt || !code || params.get("state") !== attempt.state) return failed(request, attempt?.next ?? ACCOUNT_HOME);

  const result = await signInWithGoogle({
    code,
    redirectUri: callbackUrl(request.nextUrl.origin),
    codeVerifier: attempt.codeVerifier,
  });
  if (!result.ok) return failed(request, attempt.next);

  await startSession(result.value);
  const response = NextResponse.redirect(new URL(attempt.next, request.url));
  response.cookies.delete({ name: GOOGLE_COOKIE, path: "/login/google" });
  return response;
}
