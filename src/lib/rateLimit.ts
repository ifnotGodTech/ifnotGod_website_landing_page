type RateLimiterOptions = {
  windowMs: number;
  maxRequests: number;
  maxTrackedKeys: number;
};

// In-memory, so counts are per server instance and reset when an instance restarts.
// This slows simple bots. It isn't a substitute for a platform-level firewall rule.
export function createRateLimiter({ windowMs, maxRequests, maxTrackedKeys }: RateLimiterOptions) {
  const hits = new Map<string, number[]>();

  function makeRoom(now: number) {
    for (const [key, timestamps] of hits) {
      if (now - timestamps[timestamps.length - 1] >= windowMs) hits.delete(key);
    }
    // Keys are re-inserted on each hit, so the first key is the least recently seen.
    while (hits.size >= maxTrackedKeys) {
      hits.delete(hits.keys().next().value as string);
    }
  }

  return {
    isLimited(key: string, now = Date.now()): boolean {
      const timestamps = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
      timestamps.push(now);

      hits.delete(key);
      if (hits.size >= maxTrackedKeys) makeRoom(now);
      hits.set(key, timestamps);

      return timestamps.length > maxRequests;
    },
    get trackedKeys() {
      return hits.size;
    },
  };
}
