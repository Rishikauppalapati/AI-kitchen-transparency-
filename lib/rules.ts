// Plain-code rules. No AI in this file: these decisions must be predictable.

import type { CheckId, CheckItem, GeminiResult } from "./types";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB (Vercel limits request size)
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MIN_CONFIDENCE = 0.5;

// In this MVP every check is self-declared + AI-checked photo = level 1.
// Levels 2 (sensor/document) and 3 (auditor) are out of scope.
export const EVIDENCE_LEVEL = 1;

const CHECK_IDS: CheckId[] = ["caps_gloves", "bin_lids", "labels_dates"];

export function validateUpload(file: { type: string; size: number }): string | null {
  if (file.size === 0) return "The photo is empty. Please pick another one.";
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "That file is not a photo we can read. Please upload a JPG, PNG or WebP picture.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "That photo is too large (over 4 MB). Please take a smaller one.";
  }
  return null;
}

// Gemini is asked for JSON, but we never trust it blindly.
export function parseGeminiResult(raw: unknown): GeminiResult | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.usable !== "boolean") return null;
  if (typeof r.confidence !== "number" || r.confidence < 0 || r.confidence > 1) return null;
  if (typeof r.summary !== "string" || typeof r.reason !== "string") return null;
  if (!Array.isArray(r.checks)) return null;

  const checks: CheckItem[] = [];
  for (const id of CHECK_IDS) {
    const found = r.checks.find((c) => c && (c as { id?: unknown }).id === id) as
      | { status?: unknown; note?: unknown }
      | undefined;
    if (!found) {
      // A usable photo must report on all three checks.
      if (r.usable) return null;
      checks.push({ id, status: "cannot_tell", note: "" });
      continue;
    }
    if (found.status !== "ok" && found.status !== "problem" && found.status !== "cannot_tell") {
      return null;
    }
    checks.push({ id, status: found.status, note: typeof found.note === "string" ? found.note : "" });
  }
  return {
    usable: r.usable,
    reason: r.reason,
    confidence: r.confidence,
    summary: r.summary,
    checks,
  };
}

// Decide whether to accept the photo or ask the manager to retake it.
export function retakeReason(result: GeminiResult): string | null {
  if (!result.usable) {
    return result.reason || "This does not look like a usable kitchen photo.";
  }
  if (result.confidence < MIN_CONFIDENCE) {
    return "The photo is too unclear for us to be confident. Please retake it in better light.";
  }
  if (result.checks.every((c) => c.status === "cannot_tell")) {
    return "We could not make out staff, bins or labels in this photo. Please retake it showing the kitchen.";
  }
  return null;
}

// The one-line verdict shown to diners. Plain code, not AI:
// any "problem" raises a flag; all three "ok" means good to go; otherwise it is unclear.
export type Verdict = "pass" | "flag" | "unclear";

export function verdict(checks: CheckItem[]): Verdict {
  if (checks.some((c) => c.status === "problem")) return "flag";
  if (checks.every((c) => c.status === "ok")) return "pass";
  return "unclear";
}

export function timeAgo(iso: string, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
