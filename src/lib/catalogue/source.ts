import { BILLING_TERMS, PLANS } from "@/content/plans";
import { SERVICE_GROUPS, SERVICES } from "@/content/services";
import { SITE_TEXT } from "@/content/siteText";
import { apiRequest } from "@/lib/api/http";
import { apiBaseUrl } from "@/lib/api/config";
import type { CatalogueData, SiteText } from "@/types/catalogue";
import { catalogueSchema, siteTextSchema } from "./schema";

// Where the catalogue comes from: the backend when BACKEND_API_URL is set, otherwise the content
// files in src/content. The content files go once the backend is live (backend phase 10).

/** The tag `revalidateTag` uses to refresh pages after the team saves content. */
export const CATALOGUE_TAG = "catalogue";
/** A backstop: the team's saves refresh pages straight away, through the tag. */
const REVALIDATE_SECONDS = 60 * 60;

/**
 * Throws when the backend can't give a good answer, so Next.js keeps showing the last good
 * page instead of an empty one, and a build fails loudly rather than publishing no plans.
 */
async function fromApi<T>(path: string, schema: Parameters<typeof apiRequest<T>>[1]["schema"]): Promise<T> {
  const result = await apiRequest(path, { schema, cacheFor: { revalidate: REVALIDATE_SECONDS, tags: [CATALOGUE_TAG] } });
  if (!result.ok) throw new Error(`The catalogue couldn't be loaded from the backend (${result.error.code}).`);
  return result.data;
}

export async function loadCatalogue(): Promise<CatalogueData> {
  if (apiBaseUrl()) return fromApi("/catalogue/", catalogueSchema);
  return { plans: PLANS, groups: SERVICE_GROUPS, services: SERVICES, billingTerms: BILLING_TERMS };
}

export async function loadSiteText(): Promise<SiteText> {
  if (apiBaseUrl()) return fromApi("/site-text/", siteTextSchema);
  return SITE_TEXT;
}
