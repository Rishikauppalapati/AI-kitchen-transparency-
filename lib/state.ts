// The app's saved data and the rules that change it. Pure code: no React, no clock reads.
//
// The key idea: the manager edits a DRAFT. The diner only ever reads a published SNAPSHOT.
// A snapshot is written only by signOff / confirmSetup, and only when every required tile is green.
// So a failing or half-finished check can never reach the diner.

import { restaurants } from "@/data/restaurants";
import { DINING_CHECKS, SETUP_CHECKS } from "./checkLabels";
import { alreadyDone, SLOTS, slotsDue, type NotifyTarget, type Slot } from "./notifications";
import { allChecked, TODO } from "./rules";
import { DAY, HOUR } from "./time";
import type { TileState } from "./types";

export const VERSION = 2;
export const SCHEDULE_LOOKBACK = 6 * HOUR; // after a long gap (or a big fast-forward) only the last 6 hours of reminders fire
const MAX_NOTICES = 30;
export const SHIFTS = ["11:30 AM", "6:30 PM"] as const;
export type Shift = (typeof SHIFTS)[number];
export const PACK_SECONDS = 600; // 10 minutes to answer a random pack check
export const PACK_PER_DAY = 2;
export const FLAG_AT = 3; // non-passing attempts on one tile before "Flagged for review"
export const COMPLAINT_DAYS = 30;

export type Tiles = Record<string, TileState>;
export interface Step {
  label: string;
  at: number;
}
export interface Complaint {
  id: string;
  category: string;
  seal: "intact" | "broken" | "unsure";
  steps: Step[]; // what has happened so far; steps[0] is the report itself
  resolved: boolean;
}
export interface Flag {
  key: string; // e.g. "dining:handwash"
  label: string;
  at: number;
}
export interface PackCheck {
  at: number;
  result: "passed" | "missed";
}
// A reminder for the manager: shown as a banner, then kept in the bell list.
export interface Notice {
  id: string;
  key: string; // e.g. "dining-open-due:Thu Oct 22 2026", so the same reminder never fires twice in a day
  title: string;
  body: string;
  at: number;
  target: NotifyTarget; // which check screen "Start" opens
  read: boolean;
  banner: boolean; // still showing as the slide-in banner
}

export interface RestaurantData {
  // dining
  diningDraft: Tiles;
  diningFridgeC: number | null;
  diningSnapshot: { verifiedAt: number; fridgeC: number; signedBy: string } | null;
  diningSignoffs: number[];
  // delivery
  setupDraft: Record<Shift, Tiles>;
  setupConfirmed: { shift: Shift; at: number }[];
  deliverySnapshot: { verifiedAt: number; shift: Shift } | null;
  packChecks: PackCheck[];
  packPendingSince: number | null;
  packNote: string | null;
  // shared
  failures: Record<string, number>; // non-passing attempts per tile, e.g. "dining:bins"
  flags: Flag[];
  complaints: Complaint[];
  notices: Notice[];
}

export interface AppData {
  version: number;
  lastScheduleAt: number; // reminders are checked for the time between this and "now"
  clockOffset: number; // demo clock = real time + this
  restaurants: Record<string, RestaurantData>;
}

// ---------- Seeds (placed relative to real time when the demo starts) ----------

const emptyDining = (): Tiles => Object.fromEntries(DINING_CHECKS.map((c) => [c.id, TODO]));
const emptySetup = (): Tiles => Object.fromEntries(SETUP_CHECKS.map((c) => [c.id, TODO]));

function base(): RestaurantData {
  return {
    diningDraft: emptyDining(),
    diningFridgeC: null,
    diningSnapshot: null,
    diningSignoffs: [],
    setupDraft: { "11:30 AM": emptySetup(), "6:30 PM": emptySetup() },
    setupConfirmed: [],
    deliverySnapshot: null,
    packChecks: [],
    packPendingSince: null,
    packNote: null,
    failures: {},
    flags: [],
    complaints: [],
    notices: [],
  };
}

export function seedData(now: number): AppData {
  const ago = (h: number) => now - h * HOUR;
  const days = (d: number) => now - d * DAY;
  const r: Record<string, RestaurantData> = Object.fromEntries(restaurants.map((x) => [x.id, base()]));

  Object.assign(r["sample-cafe"], {
    diningSnapshot: { verifiedAt: ago(2), fridgeC: 3.5, signedBy: "Sample manager" },
    diningSignoffs: [ago(2)],
    deliverySnapshot: { verifiedAt: ago(3), shift: "11:30 AM" },
    setupConfirmed: [{ shift: "11:30 AM", at: ago(3) }],
    packChecks: [
      { at: ago(2), result: "passed" },
      { at: ago(1), result: "passed" },
    ],
    complaints: [
      {
        id: "c1",
        category: "Seal broken",
        seal: "broken",
        resolved: true,
        steps: [
          { label: "Reported by a diner", at: days(9) },
          { label: "Kitchen responded", at: days(9) },
          { label: "Fix recorded: new double-seal routine", at: days(8) },
        ],
      },
      {
        id: "c3",
        category: "Foreign object",
        seal: "intact",
        resolved: false,
        steps: [{ label: "Reported by a diner", at: ago(20) }],
      },
    ],
  } satisfies Partial<RestaurantData>);

  Object.assign(r["sample-biryani-house"], {
    diningSnapshot: { verifiedAt: ago(30), fridgeC: 4.5, signedBy: "Sample manager" },
    deliverySnapshot: { verifiedAt: ago(8), shift: "11:30 AM" },
    setupConfirmed: [{ shift: "11:30 AM", at: ago(8) }],
    packChecks: [{ at: ago(1), result: "passed" }],
    flags: [{ key: "dining:handwash", label: "Handwash station", at: ago(5) }],
    complaints: [
      {
        id: "c2",
        category: "Spill",
        seal: "unsure",
        resolved: false,
        steps: [
          { label: "Reported by a diner", at: days(3) },
          { label: "Kitchen responded", at: days(2) },
        ],
      },
    ],
  } satisfies Partial<RestaurantData>);

  Object.assign(r["sample-bakery"], {
    diningSnapshot: { verifiedAt: now - 0.3 * HOUR, fridgeC: 2.8, signedBy: "Sample manager" },
    diningSignoffs: [now - 0.3 * HOUR],
    deliverySnapshot: { verifiedAt: ago(1), shift: "11:30 AM" },
    setupConfirmed: [{ shift: "11:30 AM", at: ago(1) }],
    packChecks: [
      { at: ago(3), result: "passed" },
      { at: ago(2), result: "passed" },
      { at: ago(1), result: "passed" },
    ],
  } satisfies Partial<RestaurantData>);

  return { version: VERSION, lastScheduleAt: now, clockOffset: 0, restaurants: r };
}

// ---------- Selectors ----------

export const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString();

export function packToday(rd: RestaurantData, now: number) {
  const today = rd.packChecks.filter((p) => sameDay(p.at, now)).sort((a, b) => a.at - b.at);
  return {
    results: today,
    passed: today.filter((p) => p.result === "passed").length,
    missed: today.filter((p) => p.result === "missed").length,
  };
}

export type ScheduleStatus = "done" | "missed" | "todo";
export interface ScheduleRow {
  id: string;
  label: string;
  when: string;
  kind: "dining" | "delivery";
  status: ScheduleStatus;
}

// Six check-ins a day. The first dining sign-off of the day counts as opening, the second as closing.
export function schedule(rd: RestaurantData, now: number): ScheduleRow[] {
  const signoffs = rd.diningSignoffs.filter((t) => sameDay(t, now)).length;
  const setups = new Set(rd.setupConfirmed.filter((s) => sameDay(s.at, now)).map((s) => s.shift));
  const { passed, missed } = packToday(rd, now);
  const pack = (i: number): ScheduleStatus => (i < passed ? "done" : i < passed + missed ? "missed" : "todo");
  const st = (done: boolean): ScheduleStatus => (done ? "done" : "todo");

  return [
    { id: "dine-open", label: "Dining opening check", when: "9:00 AM", kind: "dining", status: st(signoffs >= 1) },
    { id: "setup-am", label: "Delivery shift setup", when: "11:30 AM", kind: "delivery", status: st(setups.has("11:30 AM")) },
    { id: "pack-1", label: "Surprise packing check", when: "12 to 2 PM", kind: "delivery", status: pack(0) },
    { id: "setup-pm", label: "Delivery shift setup", when: "6:30 PM", kind: "delivery", status: st(setups.has("6:30 PM")) },
    { id: "pack-2", label: "Surprise packing check", when: "7 to 9 PM", kind: "delivery", status: pack(1) },
    { id: "dine-close", label: "Dining closing check", when: "10:30 PM", kind: "dining", status: st(signoffs >= 2) },
  ];
}

export function packSecondsLeft(rd: RestaurantData, now: number): number | null {
  if (rd.packPendingSince === null) return null;
  return Math.max(0, Math.ceil((rd.packPendingSince + PACK_SECONDS * 1000 - now) / 1000));
}

// ---------- Actions and the reducer ----------

export type Action =
  | { type: "reset"; data: AppData; now: number }
  | { type: "clock"; ms: number; now: number }
  | { type: "tile"; rid: string; id: string; tile: TileState; fridgeC?: number; now: number }
  | { type: "setupTile"; rid: string; shift: Shift; id: string; tile: TileState; now: number }
  | { type: "signOff"; rid: string; signedBy: string; now: number }
  | { type: "confirmSetup"; rid: string; shift: Shift; now: number }
  | { type: "startPack"; rid: string; now: number }
  | { type: "packPhoto"; rid: string; tile: TileState; now: number }
  | { type: "tickPack"; now: number }
  | { type: "addComplaint"; rid: string; complaint: Complaint; now: number }
  | { type: "resolveComplaint"; rid: string; id: string; text: string; now: number }
  | { type: "notify"; rid: string; slot: string; now: number } // a demo trigger button
  | { type: "readNotice"; rid: string; id: string; now: number } // "Start" was pressed
  | { type: "dismissBanner"; rid: string; id: string; now: number }
  | { type: "readAllNotices"; rid: string; now: number } // the bell list was opened
  | { type: "tickSchedule"; now: number };

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type ActionInput = DistributiveOmit<Action, "now">;

function withRestaurant(s: AppData, rid: string, fn: (rd: RestaurantData) => RestaurantData): AppData {
  const rd = s.restaurants[rid];
  if (!rd) return s;
  return { ...s, restaurants: { ...s.restaurants, [rid]: fn(rd) } };
}

// Rule 6: count non-passing attempts per tile; at FLAG_AT or more, raise a flag (manager side only).
function noteFailure(rd: RestaurantData, key: string, label: string, now: number): RestaurantData {
  const count = (rd.failures[key] ?? 0) + 1;
  const failures = { ...rd.failures, [key]: count };
  const flags = count >= FLAG_AT && !rd.flags.some((f) => f.key === key) ? [...rd.flags, { key, label, at: now }] : rd.flags;
  return { ...rd, failures, flags };
}

function clearFailures(failures: Record<string, number>, prefix: string): Record<string, number> {
  return Object.fromEntries(Object.entries(failures).filter(([k]) => !k.startsWith(prefix)));
}

function expirePack(rd: RestaurantData, now: number): RestaurantData {
  const since = rd.packPendingSince;
  if (since === null || now < since + PACK_SECONDS * 1000) return rd;
  // A missed check is recorded as missed, at the moment it ran out.
  return {
    ...rd,
    packChecks: [...rd.packChecks, { at: since + PACK_SECONDS * 1000, result: "missed" }],
    packPendingSince: null,
    packNote: null,
  };
}

// A random pack check starts a 10-minute countdown. Null when one can't start (one is running, or both are done).
function startPackCheck(rd: RestaurantData, now: number): RestaurantData | null {
  const live = expirePack(rd, now);
  const { results } = packToday(live, now);
  if (live.packPendingSince !== null || results.length >= PACK_PER_DAY) return null;
  return { ...live, packPendingSince: now, packNote: null };
}

// Add a reminder. Only the newest one shows as a banner; older ones stay in the bell list.
// A "quiet" entry goes straight into the list as already read (used to record a missed check).
function addNotice(
  rd: RestaurantData,
  slot: Slot,
  key: string,
  at: number,
  quiet?: { title: string; body: string },
): RestaurantData {
  const notice: Notice = {
    id: `n-${at}-${slot.id}-${rd.notices.length}`,
    key,
    title: quiet?.title ?? slot.title,
    body: quiet?.body ?? slot.body,
    at,
    target: slot.target,
    read: !!quiet,
    banner: !quiet,
  };
  const older = quiet ? rd.notices : rd.notices.map((n) => ({ ...n, banner: false }));
  return { ...rd, notices: [notice, ...older].slice(0, MAX_NOTICES) };
}

export function reducer(state: AppData | null, action: Action): AppData | null {
  if (action.type === "reset") return action.data;
  if (state === null) return state;

  switch (action.type) {
    case "clock":
      return { ...state, clockOffset: state.clockOffset + action.ms };

    case "tile":
      return withRestaurant(state, action.rid, (rd) => {
        const label = DINING_CHECKS.find((c) => c.id === action.id)?.label ?? action.id;
        let next: RestaurantData = {
          ...rd,
          diningDraft: { ...rd.diningDraft, [action.id]: action.tile },
          diningFridgeC:
            action.id === "fridge" ? (action.tile.state === "checked" ? (action.fridgeC ?? null) : null) : rd.diningFridgeC,
        };
        if (action.tile.state === "retake" && !action.tile.error) next = noteFailure(next, `dining:${action.id}`, label, action.now);
        return next;
      });

    case "setupTile":
      return withRestaurant(state, action.rid, (rd) => {
        const label = SETUP_CHECKS.find((c) => c.id === action.id)?.label ?? action.id;
        let next: RestaurantData = {
          ...rd,
          setupDraft: { ...rd.setupDraft, [action.shift]: { ...rd.setupDraft[action.shift], [action.id]: action.tile } },
        };
        if (action.tile.state === "retake" && !action.tile.error) next = noteFailure(next, `setup:${action.shift}:${action.id}`, label, action.now);
        return next;
      });

    // Rules 2 and 3: "Last verified" changes ONLY here, and only when all six tiles are green.
    case "signOff":
      return withRestaurant(state, action.rid, (rd) => {
        if (!allChecked(Object.values(rd.diningDraft)) || rd.diningFridgeC === null) return rd;
        return {
          ...rd,
          diningSnapshot: { verifiedAt: action.now, fridgeC: rd.diningFridgeC, signedBy: action.signedBy },
          diningSignoffs: [...rd.diningSignoffs, action.now],
          diningDraft: emptyDining(), // ready for the next check
          diningFridgeC: null,
          failures: clearFailures(rd.failures, "dining:"),
        };
      });

    // Rule 7: delivery has its own snapshot, written only when all three setup tiles are green.
    case "confirmSetup":
      return withRestaurant(state, action.rid, (rd) => {
        if (!allChecked(Object.values(rd.setupDraft[action.shift]))) return rd;
        return {
          ...rd,
          deliverySnapshot: { verifiedAt: action.now, shift: action.shift },
          setupConfirmed: [...rd.setupConfirmed, { shift: action.shift, at: action.now }],
          setupDraft: { ...rd.setupDraft, [action.shift]: emptySetup() },
          failures: clearFailures(rd.failures, `setup:${action.shift}:`),
        };
      });

    case "startPack":
      return withRestaurant(state, action.rid, (rd) => startPackCheck(rd, action.now) ?? expirePack(rd, action.now));

    case "packPhoto":
      return withRestaurant(state, action.rid, (rd) => {
        const live = expirePack(rd, action.now);
        if (live.packPendingSince === null) return live; // too late: it was recorded as missed
        if (action.tile.state === "checked") {
          // Only a passed random check counts toward "n of 3" on the diner page.
          return { ...live, packChecks: [...live.packChecks, { at: action.now, result: "passed" }], packPendingSince: null, packNote: null };
        }
        return { ...live, packNote: action.tile.note ?? "Retake needed" };
      });

    case "tickPack": {
      let changed = false;
      const next: Record<string, RestaurantData> = {};
      for (const [rid, rd] of Object.entries(state.restaurants)) {
        const e = expirePack(rd, action.now);
        if (e !== rd) changed = true;
        next[rid] = e;
      }
      return changed ? { ...state, restaurants: next } : state;
    }

    case "addComplaint":
      return withRestaurant(state, action.rid, (rd) => ({ ...rd, complaints: [action.complaint, ...rd.complaints] }));

    // A demo trigger button: fire this reminder now (a pack check also starts its countdown).
    case "notify":
      return withRestaurant(state, action.rid, (rd) => {
        const slot = SLOTS.find((s) => s.id === action.slot);
        if (!slot) return rd;
        let next = rd;
        if (slot.kind === "pack") {
          const started = startPackCheck(rd, action.now);
          if (!started) return rd;
          next = started;
        }
        return addNotice(next, slot, `manual:${action.now}:${slot.id}`, action.now);
      });

    case "readNotice":
      return withRestaurant(state, action.rid, (rd) => ({
        ...rd,
        notices: rd.notices.map((n) => (n.id === action.id ? { ...n, read: true, banner: false } : n)),
      }));

    case "dismissBanner":
      return withRestaurant(state, action.rid, (rd) => ({
        ...rd,
        notices: rd.notices.map((n) => (n.id === action.id ? { ...n, banner: false } : n)),
      }));

    case "readAllNotices":
      return withRestaurant(state, action.rid, (rd) =>
        rd.notices.some((n) => !n.read || n.banner) ? { ...rd, notices: rd.notices.map((n) => ({ ...n, read: true, banner: false })) } : rd,
      );

    // The automatic schedule, driven by the demo clock: fires whatever became due since the last check.
    case "tickSchedule": {
      const from = Math.max(state.lastScheduleAt, action.now - SCHEDULE_LOOKBACK);
      if (action.now <= from) return state;
      let fired = false;
      const next: Record<string, RestaurantData> = {};
      for (const [rid, original] of Object.entries(state.restaurants)) {
        let rd = original;
        for (const { slot, ts, key } of slotsDue(rid, from, action.now)) {
          if (rd.notices.some((n) => n.key === key)) continue; // already fired
          if (alreadyDone(slot, rd, ts)) continue; // the check was done in time, nothing to remind about
          if (slot.kind === "pack") {
            const ranOutAt = ts + PACK_SECONDS * 1000;
            if (action.now > ranOutAt) {
              // Its 10 minutes passed while nobody was watching (for example, a big fast-forward): record it as missed.
              const live = expirePack(rd, action.now);
              if (packToday(live, ts).results.length >= PACK_PER_DAY) continue;
              rd = addNotice({ ...live, packChecks: [...live.packChecks, { at: ranOutAt, result: "missed" }] }, slot, key, ranOutAt, {
                title: "Surprise packing check missed",
                body: "No photo was taken within 10 minutes.",
              });
              fired = true;
              continue;
            }
            const started = startPackCheck(rd, action.now);
            if (!started) continue;
            rd = addNotice(started, slot, key, action.now);
          } else {
            rd = addNotice(rd, slot, key, ts);
          }
          fired = true;
        }
        next[rid] = rd;
      }
      const stale = action.now - state.lastScheduleAt > 30 * 60_000;
      if (!fired && !stale) return state;
      return { ...state, lastScheduleAt: action.now, restaurants: next };
    }

    case "resolveComplaint":
      return withRestaurant(state, action.rid, (rd) => ({
        ...rd,
        complaints: rd.complaints.map((c) =>
          c.id === action.id && !c.resolved
            ? { ...c, resolved: true, steps: [...c.steps, { label: `Fix recorded: ${action.text}`, at: action.now }] }
            : c,
        ),
      }));
  }
}
