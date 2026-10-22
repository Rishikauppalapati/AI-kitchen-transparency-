"use client";

import { useEffect, useState } from "react";
import AppBar from "../AppBar";
import { Icon } from "../Icons";
import CheckTile from "./CheckTile";
import PhotoSheet from "./PhotoSheet";
import { allChecked, tileFromAi, TODO } from "@/lib/rules";
import type { Restaurant, TileState } from "@/lib/types";

const SETUP_CHECKS = [
  { id: "setup_seals", label: "Seals stocked", icon: "shield" },
  { id: "setup_bags_clean", label: "Bags and boxes clean", icon: "bag" },
  { id: "setup_hot_cold", label: "Hot and cold bags apart", icon: "thermo" },
];
const SHIFTS = ["11:30 AM", "6:30 PM"];
const PACK_SECONDS = 10 * 60;

type Slot = "passed" | "missed" | "pending";

const emptyTiles = () => Object.fromEntries(SETUP_CHECKS.map((c) => [c.id, TODO])) as Record<string, TileState>;

function mmss(total: number): string {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

// Step 3: all state here is local and resets when you leave. Step 4 saves it.
export default function DeliveryCheck({
  restaurant,
  showExpected,
}: {
  restaurant: Restaurant;
  showExpected: boolean;
}) {
  // Layer 1: shift setup
  const [shift, setShift] = useState(SHIFTS[0]);
  const [setup, setSetup] = useState<Record<string, Record<string, TileState>>>({
    [SHIFTS[0]]: emptyTiles(),
    [SHIFTS[1]]: emptyTiles(),
  });
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [photoFor, setPhotoFor] = useState<string | null>(null); // a setup check id, or "random_pack"

  // Layer 2: random pack checks (3 a day), the third is due now with a 10 minute countdown
  const [slots, setSlots] = useState<Slot[]>(["passed", "missed", "pending"]);
  const [left, setLeft] = useState(PACK_SECONDS);
  const [packNote, setPackNote] = useState<string | null>(null);
  const pending = slots.indexOf("pending");

  useEffect(() => {
    if (pending === -1) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setSlots((cur) => cur.map((x, i) => (i === cur.indexOf("pending") ? "missed" : x)));
          return PACK_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [pending]);

  const tiles = setup[shift];
  const ready = allChecked(Object.values(tiles));

  return (
    <>
      <AppBar title="Delivery check" subtitle={restaurant.name} />
      <div className="stack">
        {/* Layer 1 */}
        <section className="card block" aria-labelledby="setup-title">
          <h2 id="setup-title">1. Shift setup</h2>
          <div className="chip-row" role="group" aria-label="Shift">
            {SHIFTS.map((s) => (
              <button key={s} type="button" className="pill" aria-pressed={shift === s} onClick={() => setShift(s)}>
                {shift === s && <Icon name="check" size={16} />}
                {s}
              </button>
            ))}
          </div>
          <div className="tile-grid" style={{ marginTop: 10 }}>
            {SETUP_CHECKS.map((c) => (
              <CheckTile key={c.id} label={c.label} icon={c.icon} tile={tiles[c.id]} onOpen={() => setPhotoFor(c.id)} />
            ))}
          </div>
          {confirmed[shift] ? (
            <p className="state-line state-green">
              <Icon name="check" size={18} /> Setup confirmed (demo)
            </p>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary full"
                style={{ marginTop: 14 }}
                disabled={!ready}
                onClick={() => setConfirmed((c) => ({ ...c, [shift]: true }))}
              >
                Confirm setup
              </button>
              {!ready && <p className="muted center">All three checks must be green.</p>}
            </>
          )}
        </section>

        {/* Layer 2 */}
        <section className="card block" aria-labelledby="pack-title">
          <h2 id="pack-title">2. Random pack check</h2>
          <ul className="schedule">
            {slots.map((s, i) => (
              <li key={i}>
                <span className="tick" aria-hidden="true">
                  <Icon name={s === "passed" ? "check" : s === "missed" ? "close" : "clock"} size={16} />
                </span>
                <span className="grow">Check {i + 1} of 3</span>
                <span className={`chip ${s === "passed" ? "chip-green" : s === "missed" ? "chip-amber" : "chip-grey"}`}>
                  {s === "passed" ? "Passed" : s === "missed" ? "Missed" : "Due now"}
                </span>
              </li>
            ))}
          </ul>
          {pending !== -1 && (
            <div className="pack-due">
              <p style={{ margin: 0 }}>
                <strong>Photograph the next packed order.</strong>
              </p>
              <p className="countdown" role="timer" aria-live="off">
                <Icon name="clock" size={18} /> {mmss(left)} left
              </p>
              {packNote && (
                <p className="form-error">
                  <Icon name="alert" size={16} /> {packNote}
                </p>
              )}
              <button type="button" className="btn btn-primary full" onClick={() => setPhotoFor("random_pack")}>
                <Icon name="camera" size={20} />
                {packNote ? "Retake pack photo" : "Take pack photo"}
              </button>
            </div>
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
          title={photoFor === "random_pack" ? "Pack check photo" : (SETUP_CHECKS.find((c) => c.id === photoFor)?.label ?? "Photo check")}
          showExpected={showExpected}
          onResult={(r) => {
            const t = tileFromAi(r);
            if (photoFor === "random_pack") {
              if (t.state === "checked") {
                setSlots((cur) => cur.map((x, i) => (i === cur.indexOf("pending") ? "passed" : x)));
                setPackNote(null);
                setLeft(PACK_SECONDS);
              } else {
                setPackNote(t.note ?? "Retake needed");
              }
            } else {
              setSetup((s) => ({ ...s, [shift]: { ...s[shift], [photoFor]: t } }));
            }
          }}
          onClose={() => setPhotoFor(null)}
        />
      )}
    </>
  );
}
