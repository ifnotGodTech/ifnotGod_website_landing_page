"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AUDIT_PATH } from "@/shared/constants";

// The old one-page site's form lived at /#contact, and links to it are still shared.
// The fragment never reaches the server, so the redirect has to happen here.
export function LegacyContactRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash === "#contact") router.replace(AUDIT_PATH);
  }, [router]);

  return null;
}
