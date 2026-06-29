interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// In-memory token bucket rate limiter
// Limits each IP to `maxRequests` per `windowMs`.
export function rateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Clean up old entries passively to prevent memory leak
  if (Math.random() < 0.05) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true; // Allowed
  }

  if (entry.count >= maxRequests) {
    return false; // Rate limited
  }

  entry.count += 1;
  return true; // Allowed
}
