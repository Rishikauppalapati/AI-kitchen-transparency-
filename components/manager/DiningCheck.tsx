"use client";

import { useState } from "react";
import AppBar from "../AppBar";
import { Icon } from "../Icons";
import Sheet from "../Sheet";
import CheckTile from "./CheckTile";
import PhotoSheet from "./PhotoSheet";
import { DOCUMENTS_DUE } from "@/data/managerFake";
import { DINING_CHECKS } from "@/lib/checkLabels";
import { allChecked, DEMO_OTP, fridgeTile, parseTemperature, tileFromAi, TODO } from "@/lib/rules";
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

// Step 3: tile state lives here and resets when you leave. Step 4 moves it into saved app state.
export default function DiningCheck({
  restaurant,
  showExpected,
}: {
  restaurant: Restaurant;
  showExpected: boolean;
}) {
  const [tiles, setTiles] = useState<Record<string, TileState>>(
    Object.fromEntries(DINING_CHECKS.map((c) => [c.id, TODO])),
  );
  const [open, setOpen] = useState<Open>(null);
  const [signedOff, setSignedOff] = useState(false);

  const ready = allChecked(Object.values(tiles));
  const set = (id: string, t: TileState) => setTiles((s) => ({ ...s, [id]: t }));

  return (
    <>
      <AppBar title="Dining check" subtitle={restaurant.name} />
      <div className="stack">
        <div className="tile-grid">
          {DINING_CHECKS.map((c) => (
            <CheckTile
              key={c.id}
              label={c.label}
              icon={ICONS[c.id]}
              tile={tiles[c.id]}
              onOpen={() => setOpen(c.id === "fridge" ? { kind: "fridge" } : { kind: "photo", id: c.id })}
            />
          ))}
        </div>

        <p className="chip chip-grey" style={{ alignSelf: "flex-start" }}>
          <Icon name="doc" size={14} /> Documents due: {DOCUMENTS_DUE}
        </p>

        {signedOff ? (
          <p className="state-line state-green">
            <Icon name="check" size={18} /> Signed off (demo). Diners see this once step 4 is built.
          </p>
        ) : (
          <>
            <button type="button" className="btn btn-primary full" disabled={!ready} onClick={() => setOpen({ kind: "otp" })}>
              Sign off with OTP
            </button>
            {!ready && <p className="muted center">All six checks must be green to sign off.</p>}
          </>
        )}
      </div>

      {open?.kind === "photo" && (
        <PhotoSheet
          checkId={open.id}
          title={DINING_CHECKS.find((c) => c.id === open.id)?.label ?? "Photo check"}
          showExpected={showExpected}
          onResult={(r) => set(open.id, tileFromAi(r))}
          onClose={() => setOpen(null)}
        />
      )}
      {open?.kind === "fridge" && (
        <FridgeSheet
          onSave={(t) => {
            set("fridge", t);
            setOpen(null);
          }}
          onClose={() => setOpen(null)}
        />
      )}
      {open?.kind === "otp" && (
        <OtpSheet
          onDone={() => {
            setSignedOff(true);
            setOpen(null);
          }}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

function FridgeSheet({ onSave, onClose }: { onSave: (t: TileState) => void; onClose: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function save() {
    const c = parseTemperature(value);
    if (c === null) return setError("Enter a number between -30 and 30.");
    onSave(fridgeTile(c));
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
