"use client";

import { useState } from "react";
import AppBar from "../AppBar";
import { Icon } from "../Icons";
import Sheet from "../Sheet";
import CheckTile from "./CheckTile";
import PhotoSheet from "./PhotoSheet";
import { DOCUMENTS_DUE } from "@/data/managerFake";
import { DINING_CHECKS } from "@/lib/checkLabels";
import { useApp } from "@/lib/AppState";
import { allChecked, DEMO_OTP, errorTile, fridgeTile, parseTemperature, tileFromAi } from "@/lib/rules";
import { timeAgo } from "@/lib/time";
import type { Restaurant, TileState } from "@/lib/types";

const ICONS: Record<string, string> = {
  caps_gloves: "person",
  floors_drains: "floor",
  stock_labels: "tag",
  bins: "trash",
  handwash: "drop",
  fridge: "thermo",
};

type Open = null | { kind: "photo"; id: string } | { kind: "fridge" } | { kind: "otp" };

export default function DiningCheck({
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
  const [open, setOpen] = useState<Open>(null);
  const [justSigned, setJustSigned] = useState(false);

  const ready = allChecked(Object.values(rd.diningDraft)) && rd.diningFridgeC !== null;
  const setTile = (id: string, tile: TileState, fridgeC?: number) =>
    act({ type: "tile", rid: restaurant.id, id, tile, fridgeC });
  const flags = rd.flags.filter((f) => f.key.startsWith("dining:"));

  return (
    <>
      <AppBar title="Dining check" subtitle={restaurant.name} />
      <div className="stack">
        {rd.diningSnapshot && (
          <p className={`state-line ${justSigned ? "state-green" : "state-grey"}`} role="status">
            <Icon name={justSigned ? "check" : "clock"} size={18} />
            {justSigned ? "Signed off. Diners now see this check." : `Last signed off ${timeAgo(rd.diningSnapshot.verifiedAt, now)}`}
          </p>
        )}

        <div className="tile-grid">
          {DINING_CHECKS.map((c) => (
            <CheckTile
              key={c.id}
              label={c.label}
              icon={ICONS[c.id]}
              tile={rd.diningDraft[c.id]}
              onOpen={() => {
                setJustSigned(false);
                setOpen(c.id === "fridge" ? { kind: "fridge" } : { kind: "photo", id: c.id });
              }}
            />
          ))}
        </div>

        {flags.length > 0 && (
          <p className="state-line" style={{ background: "var(--amber-bg)", color: "var(--amber-text)" }}>
            <Icon name="alert" size={18} /> Flagged for review: {flags.map((f) => f.label).join(", ")}
          </p>
        )}

        <p className="chip chip-grey" style={{ alignSelf: "flex-start" }}>
          <Icon name="doc" size={14} /> Documents due: {DOCUMENTS_DUE}
        </p>

        <button type="button" className="btn btn-primary full" disabled={!ready} onClick={() => setOpen({ kind: "otp" })}>
          Sign off with OTP
        </button>
        {!ready && <p className="muted center">All six checks must be green to sign off. Diners see nothing until then.</p>}
      </div>

      {open?.kind === "photo" && (
        <PhotoSheet
          checkId={open.id}
          title={DINING_CHECKS.find((c) => c.id === open.id)?.label ?? "Photo check"}
          showExpected={showExpected}
          liveDemo={liveDemo}
          onResult={(r, via) => setTile(open.id, tileFromAi(r, via))}
          onError={(wait) => setTile(open.id, errorTile(wait))}
          onClose={() => setOpen(null)}
        />
      )}
      {open?.kind === "fridge" && (
        <FridgeSheet
          onSave={(c) => {
            setTile("fridge", fridgeTile(c), c);
            setOpen(null);
          }}
          onClose={() => setOpen(null)}
        />
      )}
      {open?.kind === "otp" && (
        <OtpSheet
          onDone={() => {
            act({ type: "signOff", rid: restaurant.id, signedBy: "Sample manager" });
            setJustSigned(true);
            setOpen(null);
          }}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

function FridgeSheet({ onSave, onClose }: { onSave: (celsius: number) => void; onClose: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function save() {
    const c = parseTemperature(value);
    if (c === null) return setError("Enter a number between -30 and 30.");
    onSave(c);
  }

  return (
    <Sheet title="Fridge temperature" onClose={onClose}>
      <label className="field-label first" htmlFor="fridge-c">Reading in °C</label>
      <input
        id="fridge-c"
        className="select"
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. 3.5"
      />
      <p className="muted">Green at 5°C or lower, otherwise amber. Typed by you, never judged by the AI.</p>
      {error && (
        <p className="form-error" role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      )}
      <button type="button" className="btn btn-primary full" style={{ marginTop: 14 }} onClick={save}>
        Save reading
      </button>
    </Sheet>
  );
}

function OtpSheet({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function verify() {
    if (code === DEMO_OTP) onDone();
    else setError("That code is not right. Try again.");
  }

  return (
    <Sheet title="Sign off with OTP" onClose={onClose}>
      <label className="field-label first" htmlFor="otp">Enter the 4-digit code</label>
      <input
        id="otp"
        className="select otp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={4}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
      />
      <p className="chip chip-grey" style={{ marginTop: 10 }}>
        Demo code: {DEMO_OTP}
      </p>
      {error && (
        <p className="form-error" role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      )}
      <button type="button" className="btn btn-primary full" style={{ marginTop: 14 }} disabled={code.length < 4} onClick={verify}>
        Sign off
      </button>
    </Sheet>
  );
}
