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

function FixSheet({
  complaint,
  onSave,
  onClose,
}: {
  complaint: Complaint;
  onSave: (text: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function save() {
    if (text.trim().length < 5) return setError("Describe the fix in a few words.");
    onSave(text.trim());
  }

  return (
    <Sheet title="Record the fix" onClose={onClose}>
      <p className="muted">
        {complaint.category} · {SEAL_TEXT[complaint.seal]}
      </p>
      <label className="field-label" htmlFor="fix-text">What did you change?</label>
      <textarea id="fix-text" className="textarea" rows={3} maxLength={200} value={text} onChange={(e) => setText(e.target.value)} />

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
