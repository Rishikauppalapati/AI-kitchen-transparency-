"use client";

import { useState } from "react";
import AppBar from "../AppBar";
import { Icon } from "../Icons";
import Sheet from "../Sheet";
import { useApp } from "@/lib/AppState";
import type { Complaint } from "@/lib/state";
import { timeAgo } from "@/lib/time";
import type { Restaurant } from "@/lib/types";

const SEAL_TEXT = { intact: "Seal intact", broken: "Seal broken", unsure: "Seal: not sure" } as const;

// Complaints are shared with the diner's Report screen and delivery history.
export default function ComplaintsInbox({ restaurant }: { restaurant: Restaurant }) {
  const { data, now, act } = useApp();
  const items = data.restaurants[restaurant.id].complaints;
  const [fixing, setFixing] = useState<Complaint | null>(null);

  const open = items.filter((i) => !i.resolved);
  const closed = items.filter((i) => i.resolved);

  return (
    <>
      <AppBar title="Complaints" subtitle={`${restaurant.name} · ${open.length} open`} />
      <div className="stack">
        {items.length === 0 && (
          <p className="state-line state-green">
            <Icon name="check" size={18} /> No complaints
          </p>
        )}

        {[...open, ...closed].map((c) => (
          <article key={c.id} className="card block">
            <div className="complaint-head">
              <strong>{c.category}</strong>
              <span className={`chip ${c.resolved ? "chip-green" : "chip-amber"}`}>
                <Icon name={c.resolved ? "check" : "alert"} size={14} />
                {c.resolved ? "Resolved" : "Open"}
              </span>
            </div>
            <p className="muted">
              {SEAL_TEXT[c.seal]} · {timeAgo(c.steps[0].at, now)}
            </p>
            {c.resolved ? (
              <p>{c.steps[c.steps.length - 1].label}</p>
            ) : (
              <button type="button" className="btn btn-outline full" style={{ marginTop: 8 }} onClick={() => setFixing(c)}>
                Record the fix
              </button>
            )}
          </article>
        ))}
      </div>

      {fixing && (
        <FixSheet
          complaint={fixing}
          onSave={(text) => {
            act({ type: "resolveComplaint", rid: restaurant.id, id: fixing.id, text });
            setFixing(null);
          }}
          onClose={() => setFixing(null)}
        />
      )}
    </>
  );
}

const CUSTOMER_OPTIONS = ["Full refund", "Partial refund", "Replacement order", "Coupon or voucher", "Apology only"] as const;
const KITCHEN_OPTIONS = ["Called the customer back", "Re-checked the packing area", "Retrained the packing staff", "Changed the packaging or seals"] as const;

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function FixSheet({
  complaint,
  onSave,
  onClose,
}: {
  complaint: Complaint;
  onSave: (text: string) => void;
  onClose: () => void;
}) {
  const [given, setGiven] = useState<string[]>([]); // what the customer got
  const [done, setDone] = useState<string[]>([]); // what the kitchen did
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  // "Apology only" can't be combined with a refund, replacement or voucher.
  function pickGiven(item: string) {
    if (item === "Apology only") setGiven((g) => (g.includes(item) ? [] : [item]));
    else setGiven((g) => toggle(g.filter((x) => x !== "Apology only"), item));
  }

  function save() {
    if (given.length === 0) return setError("Pick what the customer got.");
    setError(null);
    const parts = [given.join(", ")];
    if (done.length > 0) parts.push(`Kitchen: ${done.map((d) => d.charAt(0).toLowerCase() + d.slice(1)).join(", ")}`);
    if (note.trim()) parts.push(note.trim());
    onSave(parts.join(". "));
  }

  return (
    <Sheet title="Record the fix" onClose={onClose}>
      <p className="muted">
        {complaint.category} · {SEAL_TEXT[complaint.seal]}
      </p>

      <span className="field-label" id="given-label">What did the customer get? (pick at least one)</span>
      <div className="chip-wrap" role="group" aria-labelledby="given-label">
        {CUSTOMER_OPTIONS.map((o) => (
          <button key={o} type="button" className="pill" aria-pressed={given.includes(o)} onClick={() => pickGiven(o)}>
            {given.includes(o) && <Icon name="check" size={16} />}
            {o}
          </button>
        ))}
      </div>

      <span className="field-label" id="done-label">What did the kitchen do? (optional)</span>
      <div className="chip-wrap" role="group" aria-labelledby="done-label">
        {KITCHEN_OPTIONS.map((o) => (
          <button key={o} type="button" className="pill" aria-pressed={done.includes(o)} onClick={() => setDone((d) => toggle(d, o))}>
            {done.includes(o) && <Icon name="check" size={16} />}
            {o}
          </button>
        ))}
      </div>

      <label className="field-label" htmlFor="fix-text">Anything to add? (optional)</label>
      <textarea id="fix-text" className="textarea" rows={2} maxLength={120} value={note} onChange={(e) => setNote(e.target.value)} />

      {error && (
        <p className="form-error" role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      )}
      <p className="muted">Saving this updates the diner&apos;s delivery history.</p>
      <button type="button" className="btn btn-primary full" onClick={save}>
        Mark as resolved
      </button>
    </Sheet>
  );
}
