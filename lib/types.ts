// Shared shapes used by the server and the screen.

export type CheckId = "caps_gloves" | "bin_lids" | "labels_dates";
export type CheckStatus = "ok" | "problem" | "cannot_tell";

export const CHECK_LABELS: Record<CheckId, string> = {
  caps_gloves: "Staff wearing caps and gloves",
  bin_lids: "Bin lids closed",
  labels_dates: "Labels and dates visible",
};

export interface CheckItem {
  id: CheckId;
  status: CheckStatus;
  note: string;
}

// What Gemini sends back (after our code has validated it).
export interface GeminiResult {
  usable: boolean;
  reason: string;
  confidence: number; // 0 to 1
  summary: string;
  checks: CheckItem[];
}

// What we save for a restaurant after a successful check-in.
export interface StoredCheck {
  at: string; // ISO date-time
  signedBy: string;
  summary: string;
  confidence: number;
  checks: CheckItem[];
}

export interface Fix {
  date: string;
  what: string;
  proof: string;
}

export interface Raid {
  date: string;
  reported: string[];
  sourceLabel: string;
  sourceUrl: string;
  fixes: Fix[];
}

export interface Restaurant {
  id: string;
  name: string;
  area: string;
  raids: Raid[];
  seedCheck?: StoredCheck;
}

// Response of POST /api/check
export type CheckResponse =
  | { status: "verified"; check: StoredCheck }
  | { status: "retake"; reason: string }
  | { status: "error"; message: string };
