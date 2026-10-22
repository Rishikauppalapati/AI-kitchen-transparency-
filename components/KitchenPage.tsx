"use client";

import { useEffect, useState } from "react";
import RaidTimeline from "./RaidTimeline";
import { EVIDENCE_LEVEL, timeAgo, verdict, type Verdict } from "@/lib/rules";
import { CHECK_LABELS, type CheckStatus, type Restaurant, type StoredCheck } from "@/lib/types";

const ICON: Record<CheckStatus, { symbol: string; label: string }> = {
  ok: { symbol: "✓", label: "Looks fine" },
  problem: { symbol: "!", label: "Needs attention" },
  cannot_tell: { symbol: "?", label: "Can't tell from this photo" },
};

const VERDICT_TEXT: Record<Verdict, string> = {
  pass: "✓ Good to go: all three checks passed",
  flag: "⚑ Flag raised: the AI saw something that needs attention",
  unclear: "? Unclear: the photo did not show everything we check",
};

export default function KitchenPage({
  restaurant,
  check,
}: {
  restaurant: Restaurant;
  check: StoredCheck | undefined;
}) {
  // Re-render every 30 seconds so "just now" turns into "1 min ago".
  // The time is read after the page loads (not during build), so it starts empty.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="panel" aria-labelledby="diner-title">
      <p className="panel-tag">Diner view</p>
      <h2 id="diner-title">{restaurant.name}</h2>
      <p className="muted">{restaurant.area}</p>

      {check ? (
        <div className="verified">
          <p className={`verdict verdict-${verdict(check.checks)}`}>
            {VERDICT_TEXT[verdict(check.checks)]}
          </p>
          <p className="last-verified">
            Last verified: <strong>{now === null ? check.at.slice(0, 10) : timeAgo(check.at, now)}</strong>
          </p>
          <p className="muted">
            Evidence level {EVIDENCE_LEVEL} of 3 (self-declared, photo checked by AI). Signed off by {check.signedBy}.
          </p>
          <ul className="checks">
            {(check.checks).map((c) => (
              <li key={c.id} className={`check check-${c.status}`}>
                <span className="icon" aria-label={ICON[c.status].label}>
                  {ICON[c.status].symbol}
                </span>
                <span>
                  <strong>{CHECK_LABELS[c.id]}</strong>
                  {c.note && <span className="muted"> {c.note}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="ai-note">AI note: {check.summary}</p>
          <p className="label-tag">Self-reported and AI-checked. This is not an official inspection.</p>
        </div>
      ) : (
        <p className="not-verified">No kitchen check has been submitted yet.</p>
      )}

      <RaidTimeline raids={restaurant.raids} />
    </section>
  );
}
