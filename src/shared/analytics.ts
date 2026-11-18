// What page views send to Vercel Web Analytics. Some addresses carry private details after the
// path, such as a password reset link's one-time token or a payment's reference, so only the
// site and page path are ever sent.

/** The address without its query or fragment, such as https://www.ifnotgod.com/pricing. */
export function withoutPrivateDetails(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split(/[?#]/)[0];
  }
}

export function forAnalytics<T extends { url: string }>(event: T): T {
  return { ...event, url: withoutPrivateDetails(event.url) };
}
