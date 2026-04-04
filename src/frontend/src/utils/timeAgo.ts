/**
 * Converts a createdAt timestamp (bigint, Unix epoch in nanoseconds from IC)
 * to a human-readable relative time string.
 */
export function timeAgo(createdAt: bigint | number | undefined | null): string {
  if (createdAt === undefined || createdAt === null) return "";

  const ns = typeof createdAt === "bigint" ? createdAt : BigInt(createdAt);
  if (ns === 0n) return "";

  // IC timestamps are in nanoseconds; convert to milliseconds
  const ms = Number(ns / 1_000_000n);
  const now = Date.now();
  const diffMs = now - ms;

  if (diffMs < 0) return "Just Now";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just Now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60)
    return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24)
    return `${diffHour} ${diffHour === 1 ? "hour" : "hours"} ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ${diffDay === 1 ? "day" : "days"} ago`;

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4)
    return `${diffWeek} ${diffWeek === 1 ? "week" : "weeks"} ago`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12)
    return `${diffMonth} ${diffMonth === 1 ? "month" : "months"} ago`;

  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear} ${diffYear === 1 ? "year" : "years"} ago`;
}
