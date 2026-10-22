"use client";

import { useState } from "react";
import { Icon } from "./Icons";
import Sheet from "./Sheet";
import { useApp } from "@/lib/AppState";
import { PACK_PER_DAY, packToday } from "@/lib/state";
import { DAY, HOUR } from "@/lib/time";
import type { Restaurant, Role } from "@/lib/types";

function offsetText(ms: number): string {
  if (ms === 0) return "no fast-forward";
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  return `+${days > 0 ? `${days} day${days === 1 ? "" : "s"}` : ""}${days > 0 && hours > 0 ? " " : ""}${hours > 0 ? `${hours} hour${hours === 1 ? "" : "s"}` : ""}`;
}

// The floating demo controls. Notification triggers arrive in step 7.
export default function DemoPanel({
  role,
  onRole,
  restaurants,
  restaurantId,
  onRestaurant,
  showExpected,
  onShowExpected,
  onReset,
}: {
  role: Role;
  onRole: (r: Role) => void;
  restaurants: Restaurant[];
  restaurantId: string;
  onRestaurant: (id: string) => void;
  showExpected: boolean;
  onShowExpected: (on: boolean) => void;
  onReset: () => void;
}) {
  const { data, now, act } = useApp();
  const [open, setOpen] = useState(false);
  const [didReset, setDidReset] = useState(false);

  const rd = data.restaurants[restaurantId];
  const packBusy = rd.packPendingSince !== null;
  const packFull = packToday(rd, now).results.length >= PACK_PER_DAY;

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

          <span className="field-label" id="expected-label">Show expected AI result</span>
          <button
            type="button"
            className="seg-btn full-seg"
            aria-pressed={showExpected}
            aria-labelledby="expected-label"
            onClick={() => onShowExpected(!showExpected)}
          >
            {showExpected && <Icon name="check" size={16} />}
            {showExpected ? "On" : "Off"}
          </button>

          <span className="field-label" id="trigger-label">Trigger</span>
          <button
            type="button"
            className="btn btn-outline full"
            aria-labelledby="trigger-label"
            disabled={packBusy || packFull}
            onClick={() => {
              act({ type: "startPack", rid: restaurantId });
              setOpen(false);
            }}
          >
            <Icon name="bell" size={18} />
            Random pack check
          </button>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            {packBusy ? "One is already counting down." : packFull ? "All three are done for today." : "Starts a 10-minute countdown for this restaurant."}
          </p>

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
