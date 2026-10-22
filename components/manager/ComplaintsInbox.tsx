"use client";

import { useState } from "react";
import AppBar from "../AppBar";
import { Icon } from "../Icons";
import Sheet from "../Sheet";
import { INBOX, type InboxComplaint } from "@/data/managerFake";
import type { Restaurant } from "@/lib/types";

const SEAL_TEXT = { intact: "Seal intact", broken: "Seal broken", unsure: "Seal: not sure" } as const;

function age(hours: number): string {
  if (hours < 24) return `${hours} hours ago`;
  const d = Math.floor(hours / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

// Step 3: resolving a complaint only changes this screen. Step 4 updates the diner's history too.
export default function ComplaintsInbox({ restaurant }: { restaurant: Restaurant }) {
  const [items, setItems] = useState<InboxComplaint[]>(INBOX[restaurant.id] ?? []);
  const [fixing, setFixing] = useState<InboxComplaint | null>(null);

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
              {SEAL_TEXT[c.seal]} · {age(c.hoursAgo)}
            </p>
            {c.resolved ? (
              <p>
                <strong>Fix:</strong> {c.fix}
              </p>
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
            setItems((list) => list.map((i) => (i.id === fixing.id ? { ...i, resolved: true, fix: text } : i)));
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
  complaint: InboxComplaint;
  onSave: (text: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
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

      <span className="field-label" id="fix-photo-label">Photo of the fix (optional)</span>
      <label className="btn btn-outline file-btn">
        <Icon name="camera" size={18} />
        {photo ?? "Add a photo"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-labelledby="fix-photo-label"
          onChange={(e) => setPhoto(e.target.files?.[0]?.name ?? null)}
        />
      </label>

      {error && (
        <p className="form-error" role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      )}
      <p className="muted">Demo: the diner&apos;s history updates in step 4.</p>
      <button type="button" className="btn btn-primary full" onClick={save}>
        Mark as resolved
      </button>
    </Sheet>
  );
}
