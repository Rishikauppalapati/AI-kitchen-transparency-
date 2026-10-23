"use client";

import { useState } from "react";
import AppBar from "../AppBar";
import { Icon } from "../Icons";
import CheckTile from "./CheckTile";
import PhotoSheet from "./PhotoSheet";
import { SETUP_CHECKS } from "@/lib/checkLabels";
import { useApp } from "@/lib/AppState";
import { allChecked, errorTile, tileFromAi } from "@/lib/rules";
import { PACK_PER_DAY, packSecondsLeft, packToday, SHIFTS, type Shift } from "@/lib/state";
import { timeAgo } from "@/lib/time";
import type { Restaurant } from "@/lib/types";

type Slot = "passed" | "missed" | "due" | "waiting";

function mmss(total: number): string {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function DeliveryCheck({
  restaurant,
  showExpected,
  liveDemo,
}: {
  restaurant: Restaurant;
  showExpected: boolean;
  liveDemo: boolean;
}) {
  const { data, now, act } = useApp();
  const rd = data.restaurants[restaurant.id];
  const [shift, setShift] = useState<Shift>(SHIFTS[0]);
  const [photoFor, setPhotoFor] = useState<string | null>(null); // a setup check id, or "random_pack"
  const [justConfirmed, setJustConfirmed] = useState(false);

  const tiles = rd.setupDraft[shift];
  const ready = allChecked(Object.values(tiles));
  const flags = rd.flags.filter((f) => f.key.startsWith("setup:"));

  const today = packToday(rd, now);
  const left = packSecondsLeft(rd, now);
  const slots: Slot[] = Array.from({ length: PACK_PER_DAY }, (_, i) => {
    if (i < today.results.length) return today.results[i].result;
    if (i === today.results.length && left !== null) return "due";
    return "waiting";
  });

  return (
    <>
      <AppBar title="Delivery check" subtitle={restaurant.name} />
      <div className="stack">
        {/* Layer 1 */}
        <section className="card block" aria-labelledby="setup-title">
          <h2 id="setup-title">1. Shift setup</h2>
          <div className="chip-row" role="group" aria-label="Shift">
            {SHIFTS.map((s) => (
              <button
                key={s}
                type="button"
                className="pill"
                aria-pressed={shift === s}
                onClick={() => {
                  setShift(s);
                  setJustConfirmed(false);
                }}
              >
                {shift === s && <Icon name="check" size={16} />}
                {s}
              </button>
            ))}
          </div>
          <div className="tile-grid" style={{ marginTop: 10 }}>
            {SETUP_CHECKS.map((c) => (
              <CheckTile
                key={c.id}
                label={c.label}
                icon={c.icon}
                tile={tiles[c.id]}
                onOpen={() => {
                  setJustConfirmed(false);
                  setPhotoFor(c.id);
                }}
              />
            ))}
          </div>

          {flags.length > 0 && (
            <p className="state-line" style={{ background: "var(--amber-bg)", color: "var(--amber-text)" }}>
              <Icon name="alert" size={18} /> Flagged for review: {flags.map((f) => f.label).join(", ")}
            </p>
          )}

          {rd.deliverySnapshot && (
            <p className={`state-line ${justConfirmed ? "state-green" : "state-grey"}`} role="status">
              <Icon name={justConfirmed ? "check" : "clock"} size={18} />
              {justConfirmed
                ? "Setup confirmed. Diners now see this check."
                : `Last setup confirmed ${timeAgo(rd.deliverySnapshot.verifiedAt, now)}`}
            </p>
          )}

          <button
            type="button"
            className="btn btn-primary full"
            style={{ marginTop: 10 }}
            disabled={!ready}
            onClick={() => {
              act({ type: "confirmSetup", rid: restaurant.id, shift });
              setJustConfirmed(true);
            }}
          >
            Confirm setup
          </button>
          {!ready && <p className="muted center">All three checks must be green. Diners see nothing until then.</p>}
        </section>

        {/* Layer 2 */}
        <section className="card block" aria-labelledby="pack-title">
          <h2 id="pack-title">2. Surprise packing check</h2>
          <p className="muted" style={{ margin: "0 0 10px" }}>
            At a surprise time, the app asks you to photograph the next order you pack. It shows diners that orders leave sealed and clean.
          </p>
          <ul className="schedule">
            {slots.map((s, i) => (
              <li key={i}>
                <span className="tick" aria-hidden="true">
                  <Icon name={s === "passed" ? "check" : s === "missed" ? "close" : "clock"} size={16} />
                </span>
                <span className="grow">Check {i + 1} of {PACK_PER_DAY}</span>
                <span className={`chip ${s === "passed" ? "chip-green" : s === "missed" ? "chip-amber" : "chip-grey"}`}>
                  {s === "passed" ? "Passed" : s === "missed" ? "Missed" : s === "due" ? "Due now" : "Waiting"}
                </span>
              </li>
            ))}
          </ul>

          {left !== null ? (
            <div className="pack-due">
              <p style={{ margin: 0 }}>
                <strong>Photograph the next packed order.</strong>
              </p>
              <p className="countdown" role="timer" aria-live="off">
                <Icon name="clock" size={18} /> {mmss(left)} left
              </p>
              {rd.packNote && (
                <p className="form-error">
                  <Icon name="alert" size={16} /> {rd.packNote}
                </p>
              )}
              <button type="button" className="btn btn-primary full" onClick={() => setPhotoFor("random_pack")}>
                <Icon name="camera" size={20} />
                {rd.packNote ? "Retake pack photo" : "Take pack photo"}
              </button>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 10 }}>
              {today.results.length >= PACK_PER_DAY
                ? "Both checks for today are finished."
                : "The next check arrives at a random time. Use the demo controls to trigger one."}
            </p>
          )}
        </section>

        {/* Layer 3 */}
        <section className="card block" aria-labelledby="handled-title">
          <h2 id="handled-title">3. Handled for you</h2>
          <p className="chip chip-grey">Simulated in demo (needs platform data)</p>
          <ul className="check-list">
            <li>
              <span className="tick" aria-hidden="true"><Icon name="check" size={16} /></span>
              <span className="grow">Rider confirmed seal at pickup</span>
            </li>
            <li>
              <span className="tick" aria-hidden="true"><Icon name="clock" size={16} /></span>
              <span className="grow">Prep to handover</span>
              <strong>6 min</strong>
            </li>
          </ul>
        </section>
      </div>

      {photoFor && (
        <PhotoSheet
          checkId={photoFor}
          title={photoFor === "random_pack" ? "Packing check photo" : (SETUP_CHECKS.find((c) => c.id === photoFor)?.label ?? "Photo check")}
          showExpected={showExpected}
          liveDemo={liveDemo}
          onResult={(r, via) => {
            const tile = tileFromAi(r, via);
            if (photoFor === "random_pack") act({ type: "packPhoto", rid: restaurant.id, tile });
            else act({ type: "setupTile", rid: restaurant.id, shift, id: photoFor, tile });
          }}
          onError={(wait) => {
            const tile = errorTile(wait);
            if (photoFor === "random_pack") act({ type: "packPhoto", rid: restaurant.id, tile });
            else act({ type: "setupTile", rid: restaurant.id, shift, id: photoFor, tile });
          }}
          onClose={() => setPhotoFor(null)}
        />
      )}
    </>
  );
}
