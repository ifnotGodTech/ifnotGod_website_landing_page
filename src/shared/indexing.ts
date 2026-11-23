// Whether search engines may index this copy of the site. On Vercel, only the live project's
// production build, served at ifnotgod.com, is indexed. Previews, and the separate staging project
// (whose own production address is staging.ifnotgod.com), stay out of search results. Vercel sets
// VERCEL_PROJECT_PRODUCTION_URL to the project's shortest production domain, without https://.
// Local runs and test builds aren't on Vercel, and aren't public.

const LIVE_DOMAINS = new Set(["ifnotgod.com", "www.ifnotgod.com"]);

export function isSearchable(env: Record<string, string | undefined> = process.env): boolean {
  if (!env.VERCEL_ENV) return true;
  return env.VERCEL_ENV === "production" && LIVE_DOMAINS.has(env.VERCEL_PROJECT_PRODUCTION_URL ?? "");
}
