export const severityWeight: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export function calculatePriorityScore(
  severity: string,
  upvotes: number = 0,
  verifications: number = 0
): number {
  const weight = severityWeight[severity] || 1;
  const score =
    weight * 20 +
    Math.min(upvotes, 50) * 0.5 +
    Math.min(verifications, 20) * 1;

  // Clamp to 0-100
  return Math.min(Math.max(score, 0), 100);
}
