import { NextResponse } from "next/server";
import { getPublicPricing } from "@/lib/catalogue";
import { SITE_URL } from "@/shared/constants";

// Today's plans, prices and plan terms as JSON, for our AI assistant in n8n. Read-only, public and
// keyless: it holds only what the pricing page already shows. It reads the same cached catalogue as
// the pricing page, so a price saved in the dashboard appears here when the pricing page updates.

export async function GET() {
  try {
    const pricing = await getPublicPricing(SITE_URL);
    return NextResponse.json(pricing, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch {
    console.error("[pricing] the catalogue couldn't be loaded");
    return NextResponse.json(
      { error: "Prices are unavailable right now. Please try again shortly." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
