// Server-only settings for the backend. Never import this from a Client Component.

/** The backend's address, such as https://api.ifnotgod.com, without the /api/v1 prefix. */
export function apiBaseUrl(): string | null {
  const value = process.env.BACKEND_API_URL;
  return value ? value.replace(/\/+$/, "") : null;
}

/** WEB's own key for the backend. Every request must send it. */
export function apiAppKey(): string | null {
  return process.env.BACKEND_APP_KEY || null;
}

/**
 * Which release of this site is running: the deployed commit on Vercel. Vercel keeps cached
 * responses across deployments, so cached reads send it (see apiRequest), giving each release
 * its own copy. Otherwise a release that changes a response's shape would read the shape the old
 * release cached, fail its check and take the page down until the cache refreshed.
 */
export function siteRelease(): string | null {
  return process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || null;
}

export const API_PREFIX = "/api/v1";
export const API_TIMEOUT_MS = 10_000;
/**
 * Cached reads (plans, services, site text) run during builds and background refreshes, where no
 * visitor waits, so they allow time for a sleeping backend on Render's free plan to wake (up to a minute).
 */
export const CACHED_API_TIMEOUT_MS = 70_000;
