"use client";

import { Analytics } from "@vercel/analytics/next";
import { forAnalytics } from "@/shared/analytics";

// Vercel Web Analytics: page views without cookies, sent to this site's own address, so the
// security policy needs no change. It runs only on Vercel, once Web Analytics is enabled on the
// project, and the Privacy Policy describes it.
export function SiteAnalytics() {
  return <Analytics beforeSend={forAnalytics} />;
}
