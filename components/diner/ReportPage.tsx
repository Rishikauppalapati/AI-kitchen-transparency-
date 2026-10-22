"use client";

import { useState } from "react";
import AppBar from "../AppBar";
import { Icon } from "../Icons";
import RestaurantChips from "../RestaurantChips";
import { ComplaintTimeline } from "./DeliveryPage";
import { useApp } from "@/lib/AppState";
import { COMPLAINT_CATEGORIES } from "@/lib/checkLabels";
import type { Restaurant } from "@/lib/types";

type Seal = "yes" | "no" | "unsure";
const SEAL_LABEL: Record<Seal, string> = { yes: "Yes", no: "No", unsure: "Not sure" };
const SEAL_VALUE = { yes: "intact", no: "broken", unsure: "unsure" } as const;

// A report becomes a real complaint: it shows up in the manager's Complaints inbox,
// and this status timeline updates when the manager records the fix.
export default function ReportPage({
  restaurants,
  restaurant,
  onSelect,
}: {
  restaurants: Restaurant[];
  restaurant: Restaurant;
  onSelect: (id: string) => void;
}) {
  const { data, now, act } = useApp();
  const [category, setCategory] = useState<string | null>(null);
  const [seal, setSeal] = useState<Seal | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);

  const sent = sentId ? data.restaurants[restaurant.id].complaints.find((c) => c.id === sentId) : undefined;

  function submit() {
    if (!category) return setError("Pick what went wrong first.");
    if (!seal) return setError("Tell us if the seal was intact.");
    setError(null);
    const id = `c-${now}`;
    act({
      type: "addComplaint",
      rid: restaurant.id,
      complaint: {
        id,
        category,
        seal: SEAL_VALUE[seal],
        resolved: false,
        steps: [
          { label: "Reported by a diner", at: now },
          { label: "Sent to the kitchen", at: now },
        ],
      },
    });
    setSentId(id);
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
            <p className="muted">{sent.category}</p>
          </div>
          <h3>Status</h3>
          <ComplaintTimeline c={sent} now={now} />
          <button
            type="button"
            className="btn btn-primary full"
            style={{ marginTop: 14 }}
            onClick={() => {
              setSentId(null);
              setCategory(null);
              setSeal(null);
              setNote("");
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
