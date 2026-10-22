// Shared shapes. Kept small on purpose; later steps add check and snapshot types.

export type Role = "manager" | "diner";
export type DinerTab = "dining" | "delivery" | "news" | "report";
export type ManagerTab = "home" | "dining" | "delivery" | "complaints";

// What the AI (or a demo photo's expected result) says about one photo.
export type AiStatus = "pass" | "fail" | "cannot_tell";
export interface AiResult {
  relevant: boolean; // false = the photo doesn't show the thing asked about
  status: AiStatus;
  note: string; // at most 12 words
}

// How a check tile looks to the manager.
export interface TileState {
  state: "todo" | "checked" | "retake";
  note?: string;
}

export type RaidState = "resolved" | "unresolved" | "none";
export type HeroTone = "teal" | "amber" | "slate";

export interface Fix {
  date: string;
  what: string;
  evidence: string;
  evidenceLevel: 1 | 2 | 3; // 1 photo, 2 sensor or document, 3 auditor
}

export interface Raid {
  reportedOn: string;
  reported: string[]; // always worded "reported"
  action: string;
  fixes: Fix[];
  recheck?: { date: string; result: string };
  sourceLabel: string;
  sourceUrl: string;
}

export interface Restaurant {
  id: string;
  name: string;
  area: string;
  cuisine: string;
  tone: HeroTone;
  raidState: RaidState;
  raid?: Raid;
  streakDays: number;
}
