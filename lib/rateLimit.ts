import { LRUCache } from "lru-cache";

const rateLimitCache = new LRUCache<string, number[]>({ max: 500 });

export function rateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = rateLimitCache.get(identifier) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);
  
  if (recent.length >= limit) return false;
  
  rateLimitCache.set(identifier, [...recent, now]);
  return true;
}
