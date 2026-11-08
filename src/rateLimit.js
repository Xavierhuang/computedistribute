// In-memory fixed-window rate limiter. Per process and reset on restart, which is
// enough to blunt password guessing and signup spam on a single app instance.

function createRateLimiter({ limit, windowMs }) {
  const hits = new Map();
  return {
    // Returns true when `key` is still under its limit (and counts this hit).
    take(key) {
      const now = Date.now();
      const entry = hits.get(key);
      if (!entry || now - entry.start >= windowMs) {
        hits.set(key, { start: now, count: 1 });
        if (hits.size > 10_000) {
          for (const [k, v] of hits) if (now - v.start >= windowMs) hits.delete(k);
        }
        return true;
      }
      entry.count += 1;
      return entry.count <= limit;
    },
    reset(key) {
      hits.delete(key);
    },
  };
}

module.exports = { createRateLimiter };
