"use client";

import { useState } from "react";
import { Icon } from "./Icons";
import Sheet from "./Sheet";
import { useApp } from "@/lib/AppState";
import { AUTO_NOTIFY_MS, MANUAL_SLOTS } from "@/lib/notifications";
import { PACK_PER_DAY, packToday } from "@/lib/state";
import { DAY, HOUR } from "@/lib/time";
import type { Restaurant, Role } from "@/lib/types";

function offsetText(ms: number): string {
  if (ms === 0) return "no fast-forward";
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  return `+${days > 0 ? `${days} day${days === 1 ? "" : "s"}` : ""}${days > 0 && hours > 0 ? " " : ""}${hours > 0 ? `${hours} hour${hours === 1 ? "" : "s"}` : ""}`;
}

// The floating demo controls.
export default function DemoPanel({
  role,
  onRole,
  restaurants,
  restaurantId,
  onRestaurant,
  autoNotify,
  onAutoNotify,
  onReset,
}: {
  role: Role;
  onRole: (r: Role) => void;
  restaurants: Restaurant[];
  restaurantId: string;
  onRestaurant: (id: string) => void;
  autoNotify: boolean;
  onAutoNotify: (on: boolean) => void;
  onReset: () => void;
}) {
  const { data, now, act } = useApp();
  const [open, setOpen] = useState(false);
  const [didReset, setDidReset] = useState(false);

  const rd = data.restaurants[restaurantId];
  const packBusy = rd.packPendingSince !== null;
  const packFull = packToday(rd, now).results.length >= PACK_PER_DAY;

  // Reminders show up in the manager's view, so switch to it and close the panel to see the banner.
  function trigger(slot: string) {
    onRole("manager");
    act({ type: "notify", rid: restaurantId, slot });
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="demo-fab on-dark"
        onClick={() => {
          setDidReset(false);
          setOpen(true);
        }}
        aria-label="Open demo controls"
      >
        <Icon name="sliders" />
      </button>

      {open && (
        <Sheet title="Demo controls" onClose={() => setOpen(false)}>
          <span className="field-label first" id="role-label">Who are you?</span>
          <div className="segmented" role="group" aria-labelledby="role-label">
            {(["diner", "manager"] as Role[]).map((r) => (
              <button key={r} type="button" className="seg-btn" aria-pressed={role === r} onClick={() => onRole(r)}>
                {role === r && <Icon name="check" size={16} />}
                {r === "diner" ? "Diner" : "Manager"}
              </button>
            ))}
          </div>

          <label className="field-label" htmlFor="restaurant-select">Restaurant</label>
          <select id="restaurant-select" className="select" value={restaurantId} onChange={(e) => onRestaurant(e.target.value)}>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {role === "manager" ? (
            <>
          <span className="field-label" id="clock-label">Demo clock</span>
          <p className="muted" style={{ margin: "0 0 8px" }} aria-live="polite">
            {new Date(now).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{" "}
            ({offsetText(data.clockOffset)})
          </p>
          <div className="segmented three" role="group" aria-labelledby="clock-label">
            <button type="button" className="seg-btn" onClick={() => act({ type: "clock", ms: HOUR })}>+1 hour</button>
            <button type="button" className="seg-btn" onClick={() => act({ type: "clock", ms: 6 * HOUR })}>+6 hours</button>
            <button type="button" className="seg-btn" onClick={() => act({ type: "clock", ms: DAY })}>+1 day</button>
          </div>

          <span className="field-label" id="auto-label">Auto notifications</span>
          <button
            type="button"
            className="seg-btn full-seg"
            aria-pressed={autoNotify}
            aria-labelledby="auto-label"
            onClick={() => onAutoNotify(!autoNotify)}
          >
            {autoNotify && <Icon name="check" size={16} />}
            {autoNotify ? `On: one every ${AUTO_NOTIFY_MS / 60000} minutes` : "Off"}
          </button>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            While you are in the Manager view, a reminder pops up by itself now and then. It waits while a sheet is open, and until you have opened the last one. Turn this off, or press any button below to show one on demand.
          </p>

          <span className="field-label" id="trigger-label">Trigger a notification</span>
          <div className="trigger-grid" role="group" aria-labelledby="trigger-label">
            {MANUAL_SLOTS.map((s) => (
              <button key={s.id} type="button" className="seg-btn small" onClick={() => trigger(s.id)}>
                {s.label}
              </button>
            ))}
            <button type="button" className="seg-btn small wide" disabled={packBusy || packFull} onClick={() => trigger("pack-1")}>
              <Icon name="bell" size={16} />
              Random pack check
            </button>
          </div>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            {packBusy
              ? "A pack check is already counting down."
              : packFull
                ? "All three pack checks are done for today."
                : "Shows a banner for this restaurant. A pack check also starts its 10-minute countdown."}{" "}
            The same reminders also fire by themselves as the demo clock passes their time.
          </p>
            </>
          ) : (
            <p className="muted" style={{ margin: "14px 0 0" }}>
              The demo clock and notification options appear when you switch to Manager.
            </p>
          )}

          <span className="field-label">Start over</span>
          <button
            type="button"
            className="btn btn-outline full"
            onClick={() => {
              onReset();
              setDidReset(true);
            }}
          >
            Reset demo
          </button>
          {didReset && (
            <p className="muted" role="status" style={{ margin: "6px 0 0" }}>
              Demo reset to the starting data.
            </p>
          )}
        </Sheet>
      )}
    </>
  );
}
