// The notification schedule. Pure code: it only decides WHEN something is due and whether it is still needed.
// (`import type` means there is no runtime link back to state.ts.)

import type { RestaurantData } from "./state";

export type NotifyTarget = "dining" | "delivery";
export type SlotKind = "reminder" | "due" | "late" | "setup" | "pack";

export interface Slot {
  id: string;
  kind: SlotKind;
  label: string; // short name for the demo trigger button
  title: string;
  body: string;
  target: NotifyTarget; // which check screen "Start" opens
  minutes?: number; // fixed time of day, in minutes after midnight
  window?: [number, number]; // or a random-looking time inside this window (random pack checks)
}

const DINING_BODY = "Six checks, about five minutes.";

export const SLOTS: Slot[] = [
  { id: "dining-open-remind", kind: "reminder", label: "Opening: 30 min before", title: "Dining opening check in 30 minutes", body: "Due at 9:00 AM. " + DINING_BODY, target: "dining", minutes: 8 * 60 + 30 },
  { id: "dining-open-due", kind: "due", label: "Opening: due 9:00", title: "Time for the dining opening check", body: DINING_BODY, target: "dining", minutes: 9 * 60 },
  { id: "dining-open-late", kind: "late", label: "Opening: follow-up 9:30", title: "Opening check not done yet", body: "It was due at 9:00 AM. Please do it now.", target: "dining", minutes: 9 * 60 + 30 },
  { id: "setup-am", kind: "setup", label: "Delivery setup 11:30 AM", title: "Delivery shift setup", body: "Three photo checks before the lunch rush.", target: "delivery", minutes: 11 * 60 + 30 },
  { id: "pack-1", kind: "pack", label: "Surprise packing check", title: "Surprise packing check", body: "Photograph the next order you pack, to show it leaves sealed and clean. You have 10 minutes.", target: "delivery", window: [12 * 60, 14 * 60] },
  { id: "setup-pm", kind: "setup", label: "Delivery setup 6:30 PM", title: "Delivery shift setup", body: "Three photo checks before the dinner rush.", target: "delivery", minutes: 18 * 60 + 30 },
  { id: "pack-2", kind: "pack", label: "Surprise packing check", title: "Surprise packing check", body: "Photograph the next order you pack, to show it leaves sealed and clean. You have 10 minutes.", target: "delivery", window: [19 * 60, 21 * 60] },
  { id: "dining-close-remind", kind: "reminder", label: "Closing: 30 min before", title: "Dining closing check in 30 minutes", body: "Due at 10:30 PM. " + DINING_BODY, target: "dining", minutes: 22 * 60 },
  { id: "dining-close-due", kind: "due", label: "Closing: due 10:30", title: "Time for the dining closing check", body: DINING_BODY, target: "dining", minutes: 22 * 60 + 30 },
  { id: "dining-close-late", kind: "late", label: "Closing: follow-up 11:00", title: "Closing check not done yet", body: "It was due at 10:30 PM. Please do it now.", target: "dining", minutes: 23 * 60 },
];

// Demo mode: a reminder pops up by itself this often, cycling through the list below (for showing the app to someone).
// It also waits until every earlier reminder has been opened, so they never pile up.
export const AUTO_NOTIFY_MS = 120_000;
export const AUTO_SEQUENCE = [
  "dining-open-remind",
  "dining-open-due",
  "dining-open-late",
  "setup-am",
  "pack-1",
  "setup-pm",
  "dining-close-remind",
  "dining-close-due",
  "dining-close-late",
];

// The buttons in the demo panel (the two surprise packing checks share one button).
export const MANUAL_SLOTS = SLOTS.filter((s) => s.kind !== "pack");

const dayStart = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString();

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

// When this slot happens on the given day. Random pack checks get a steady "random" minute per restaurant per day.
export function slotTime(slot: Slot, rid: string, dayMs: number): number {
  const base = dayStart(dayMs);
  if (slot.window) {
    const [from, to] = slot.window;
    const minute = from + (hash(`${rid}:${new Date(base).toDateString()}:${slot.id}`) % (to - from));
    return base + minute * 60_000;
  }
  return base + (slot.minutes ?? 0) * 60_000;
}

// Has the check this slot is about already been done before it was due? Then there is nothing to remind about.
export function alreadyDone(slot: Slot, rd: RestaurantData, ts: number): boolean {
  const signoffs = rd.diningSignoffs.filter((t) => sameDay(t, ts) && t <= ts).length;
  if (slot.id.startsWith("dining-open")) return signoffs >= 1;
  if (slot.id.startsWith("dining-close")) return signoffs >= 2;
  if (slot.id === "setup-am" || slot.id === "setup-pm") {
    const shift = slot.id === "setup-am" ? "11:30 AM" : "6:30 PM";
    return rd.setupConfirmed.some((s) => s.shift === shift && sameDay(s.at, ts) && s.at <= ts);
  }
  return false;
}

// Everything that became due in the window (from, to]. Days are walked one by one, so a fast-forward still works.
export function slotsDue(rid: string, from: number, to: number): { slot: Slot; ts: number; key: string }[] {
  const out: { slot: Slot; ts: number; key: string }[] = [];
  for (let day = dayStart(from); day <= to; day += 24 * 3_600_000) {
    for (const slot of SLOTS) {
      const ts = slotTime(slot, rid, day);
      if (ts > from && ts <= to) out.push({ slot, ts, key: `${slot.id}:${new Date(day).toDateString()}` });
    }
  }
  return out.sort((a, b) => a.ts - b.ts);
}
