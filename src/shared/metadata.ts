import type { Metadata } from "next";

export const SITE_NAME = "IFNOTGOD TECH LTD";

// Set on every page, because a page's own sharing details replace the image Next.js would
// otherwise add from src/app/opengraph-image.png. Keep the alt text in step with that file's.
const SHARE_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "IFNOTGOD TECH LTD: Every Problem Has a Tech Solution. AI automations for businesses and creators in Nigeria.",
};

type PageMetadataInput = {
  title: string;
  description: string;
  /** The page's path, such as "/pricing". Used for its canonical URL and sharing link. */
  path: string;
  /** Set to false for pages that shouldn't appear in search results. */
  index?: boolean;
};

// Every page sets its own title, description, canonical URL and sharing details, so
// nothing falls back to another page's values.
export function buildPageMetadata({ title, description, path, index = true }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE_NAME, type: "website", locale: "en_NG", images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE] },
    ...(index ? {} : { robots: { index: false, follow: false } }),
  };
}
