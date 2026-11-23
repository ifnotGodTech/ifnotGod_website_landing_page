import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/constants";
import { isSearchable } from "@/shared/indexing";

export default function robots(): MetadataRoute.Robots {
  // Previews and the staging project (staging.ifnotgod.com) stay out of search results.
  if (!isSearchable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
