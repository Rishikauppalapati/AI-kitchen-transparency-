// Wording and freshness rules for "Last verified". Pure functions: no clock reads in here.

// "just now" under 1 minute, then "x min ago", "x hours ago", "yesterday", "N days ago".
export function timeAgo(thenMs: number, nowMs: number): string {
  const seconds = Math.max(0, Math.floor((nowMs - thenMs) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (hours < 48) return "yesterday";
  return `${Math.floor(hours / 24)} days ago`;
}

export type FreshTone = "green" | "amber" | "grey";

export interface Freshness {
  tone: FreshTone;
  label: string;
  stale: boolean; // stale = ticks are greyed and labelled "last known"
}

// Dining: up to 12 h green, 12 to 24 h amber, over 24 h grey.
export function diningFreshness(hoursSince: number): Freshness {
  if (hoursSince <= 12) return { tone: "green", label: "Verified today", stale: false };
  if (hoursSince <= 24) return { tone: "amber", label: "Check overdue", stale: false };
  const days = Math.max(1, Math.floor(hoursSince / 24));
  return { tone: "grey", label: `Not verified for ${days} day${days === 1 ? "" : "s"}`, stale: true };
}

// Delivery: up to 6 h green, over 6 h amber.
export function deliveryFreshness(hoursSince: number): Freshness {
  if (hoursSince <= 6) return { tone: "green", label: "Setup verified", stale: false };
  return { tone: "amber", label: "Setup check overdue", stale: false };
}

export function formatDay(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// For fixed seed dates like "2026-10-03" (read as UTC so the day never shifts).
export function formatIso(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;
