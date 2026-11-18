import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/constants";

export default function robots(): MetadataRoute.Robots {
  // Vercel's preview copies, including staging.ifnotgod.com, stay out of search results.
  if (process.env.VERCEL_ENV === "preview") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
