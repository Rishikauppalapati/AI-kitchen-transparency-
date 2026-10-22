// Shared shapes. Kept small on purpose; later steps add check and snapshot types.

export type Role = "manager" | "diner";
export type DinerTab = "dining" | "delivery" | "news" | "report";
export type ManagerTab = "home" | "dining" | "delivery" | "complaints";

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
