import { NextResponse, type NextRequest } from "next/server";
import { getAccountsBackend } from "@/lib/accounts";
import { safeNextPath, withNext } from "@/lib/accounts/paths";
import { startSession } from "@/lib/accounts/session";
import { ACCOUNTS_ENABLED } from "@/shared/features";

// Starts Google sign-in. The stand-in signs in a sample Google user straight away.
// Phase 12 replaces this with a redirect to Google through the backend.
export async function GET(request: NextRequest) {
  if (!ACCOUNTS_ENABLED) return new NextResponse(null, { status: 404 });

  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const result = await getAccountsBackend().signInWithGoogle();
  if (!result.ok) return NextResponse.redirect(new URL(withNext("/login", next), request.url));

  await startSession(result.value);
  return NextResponse.redirect(new URL(next, request.url));
}
