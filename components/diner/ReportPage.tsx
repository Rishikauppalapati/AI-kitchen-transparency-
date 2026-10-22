"use client";

import { useState } from "react";
import AppBar from "../AppBar";
import { Icon } from "../Icons";
import RestaurantChips from "../RestaurantChips";
import { COMPLAINT_CATEGORIES } from "@/lib/checkLabels";
import type { Restaurant } from "@/lib/types";

type Seal = "yes" | "no" | "unsure";
const SEAL_LABEL: Record<Seal, string> = { yes: "Yes", no: "No", unsure: "Not sure" };

// Step 2: the form and the status timeline, with fake data.
// Step 4 connects it to the manager's Complaints inbox.
export default function ReportPage({
  restaurants,
  restaurant,
  onSelect,
}: {
  restaurants: Restaurant[];
  restaurant: Restaurant;
  onSelect: (id: string) => void;
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [seal, setSeal] = useState<Seal | null>(null);
  const [note, setNote] = useState("");
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  function submit() {
    if (!category) return setError("Pick what went wrong first.");
    if (!seal) return setError("Tell us if the seal was intact.");
    setError(null);
    setSent(category);
  }

  if (sent) {
    return (
      <>
        <AppBar title="Report sent" subtitle={restaurant.name} />
        <section className="card block">
          <div className="success">
            <span className="success-icon" aria-hidden="true">
              <Icon name="check" size={32} />
            </span>
            <h3>Thanks, we have your report</h3>
            <p className="muted">{sent}</p>
          </div>
          <h3>Status</h3>
          <ol className="timeline">
            <li className="done">
              <span className="dot" aria-hidden="true"><Icon name="check" size={14} /></span>
              <div>Report received</div>
            </li>
            <li>
              <span className="dot pending" aria-hidden="true" />
              <div>Sent to the kitchen</div>
            </li>
            <li>
              <span className="dot pending" aria-hidden="true" />
              <div>Fix recorded</div>
            </li>
          </ol>
          <p className="chip chip-grey">Demo: not yet connected to the manager inbox (step 4)</p>
          <button
            type="button"
            className="btn btn-primary full"
            style={{ marginTop: 14 }}
            onClick={() => {
              setSent(null);
              setCategory(null);
              setSeal(null);
              setNote("");
              setPhotoName(null);
            }}
          >
            Report another problem
          </button>
        </section>
      </>
    );
  }

  return (
    <>
      <AppBar title="Report a problem" />
      <div className="stack">
        <RestaurantChips restaurants={restaurants} selectedId={restaurant.id} onSelect={onSelect} />

        <section className="card block">
          <span className="field-label first" id="cat-label">What went wrong?</span>
          <div className="chip-wrap" role="group" aria-labelledby="cat-label">
            {COMPLAINT_CATEGORIES.map((c) => (
              <button key={c} type="button" className="pill" aria-pressed={category === c} onClick={() => setCategory(c)}>
                {category === c && <Icon name="check" size={16} />}
                {c}
              </button>
            ))}
          </div>

          <span className="field-label" id="seal-label">Was the seal intact?</span>
          <div className="segmented three" role="group" aria-labelledby="seal-label">
            {(Object.keys(SEAL_LABEL) as Seal[]).map((s) => (
              <button key={s} type="button" className="seg-btn" aria-pressed={seal === s} onClick={() => setSeal(s)}>
                {seal === s && <Icon name="check" size={16} />}
                {SEAL_LABEL[s]}
              </button>
            ))}
          </div>

          <label className="field-label" htmlFor="note">Note (optional)</label>
          <textarea id="note" className="textarea" rows={3} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />

          <span className="field-label" id="photo-label">Photo (optional)</span>
          <label className="btn btn-outline file-btn">
            <Icon name="plus" size={18} />
            {photoName ?? "Add a photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-labelledby="photo-label"
              onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? null)}
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              <Icon name="alert" size={16} /> {error}
            </p>
          )}

          <button type="button" className="btn btn-primary full" style={{ marginTop: 18 }} onClick={submit}>
            Send report
          </button>
        </section>
      </div>
    </>
  );
}
