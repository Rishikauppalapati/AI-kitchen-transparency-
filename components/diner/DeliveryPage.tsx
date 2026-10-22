"use client";

import { useState } from "react";
import AppBar from "../AppBar";
import FreshnessBadge from "../FreshnessBadge";
import { Icon } from "../Icons";
import RestaurantChips from "../RestaurantChips";
import OrderSheet from "./OrderSheet";
import { useApp } from "@/lib/AppState";
import { COMPLAINT_DAYS, PACK_PER_DAY, packToday, type Complaint as ComplaintData } from "@/lib/state";
import { DAY, deliveryFreshness, HOUR, timeAgo, type Freshness } from "@/lib/time";
import type { Restaurant } from "@/lib/types";

const NEVER: Freshness = { tone: "grey", label: "Not verified yet", stale: true };
const SEAL_TEXT = { intact: "intact", broken: "reported broken", unsure: "not sure" } as const;

export function ComplaintTimeline({ c, now }: { c: ComplaintData; now: number }) {
  return (
    <ol className="timeline">
      {c.steps.map((s) => (
        <li key={s.label + s.at} className="done">
          <span className="dot" aria-hidden="true">
            <Icon name="check" size={14} />
          </span>
          <div>
            {s.label}
            <div className="muted">{timeAgo(s.at, now)}</div>
          </div>
        </li>
      ))}
      {!c.resolved && (
        <li>
          <span className="dot pending" aria-hidden="true" />
          <div>Fix not recorded yet</div>
        </li>
      )}
    </ol>
  );
}

// The diner reads ONLY the published delivery snapshot and today's passed pack checks.
export default function DeliveryPage({
  restaurants,
  restaurant,
  onSelect,
}: {
  restaurants: Restaurant[];
  restaurant: Restaurant;
  onSelect: (id: string) => void;
}) {
  const { data, now } = useApp();
  const [ordering, setOrdering] = useState(false);
  const rd = data.restaurants[restaurant.id];

  const snap = rd.deliverySnapshot;
  const fresh = snap ? deliveryFreshness((now - snap.verifiedAt) / HOUR) : NEVER;
  const passed = packToday(rd, now).passed;
  const recent = rd.complaints.filter((c) => c.steps[0].at >= now - COMPLAINT_DAYS * DAY);

  return (
    <>
      <AppBar title="Delivery" subtitle={`${restaurant.name} · kitchen proof`} />
      <div className="stack">
        <RestaurantChips restaurants={restaurants} selectedId={restaurant.id} onSelect={onSelect} />

        <section className="card block" aria-labelledby="delivery-proof">
          <h2 id="delivery-proof" className="sr-only">Delivery kitchen proof</h2>
          <FreshnessBadge freshness={fresh} />
          {snap ? (
            <p className="big">
              Last verified: <strong>{timeAgo(snap.verifiedAt, now)}</strong>
            </p>
          ) : (
            <p className="muted" style={{ marginTop: 12 }}>
              No delivery setup has been completed yet.
            </p>
          )}

          <h3>Pack checks today</h3>
          <div className="dots" role="img" aria-label={`${passed} of ${PACK_PER_DAY} pack checks passed today`}>
            {Array.from({ length: PACK_PER_DAY }, (_, i) => (
              <span key={i} className={`pack-dot ${i < passed ? "on" : ""}`}>
                {i < passed ? <Icon name="check" size={16} /> : i + 1}
              </span>
            ))}
            <span className="grow">
              <strong>
                {passed} of {PACK_PER_DAY}
              </strong>{" "}
              passed
            </span>
          </div>

          {snap && (
            <ul className="check-list" style={{ marginTop: 12 }}>
              <li>
                <span className="tick" aria-hidden="true"><Icon name="check" size={16} /></span>
                <span className="grow">Hot and cold kept apart at setup</span>
              </li>
              <li>
                <span className="tick" aria-hidden="true"><Icon name="check" size={16} /></span>
                <span className="grow">
                  {passed > 0
                    ? `Seal sticker seen on ${passed} passed pack ${passed === 1 ? "check" : "checks"}`
                    : "No pack checks passed yet today"}
                </span>
              </li>
            </ul>
          )}
          <p className="label-tag">Self-reported, AI-checked</p>
        </section>

        <button type="button" className="btn btn-primary full" onClick={() => setOrdering(true)}>
          <Icon name="bag" size={20} />
          Order now
        </button>

        <section className="card block" aria-labelledby="complaints-title">
          <h2 id="complaints-title">Complaints, last {COMPLAINT_DAYS} days</h2>
          {recent.length === 0 ? (
            <p className="state-line state-green">
              <Icon name="check" size={18} /> No complaints in the last {COMPLAINT_DAYS} days
            </p>
          ) : (
            recent.map((c) => (
              <article key={c.id} className="complaint">
                <div className="complaint-head">
                  <strong>{c.category}</strong>
                  <span className={`chip ${c.resolved ? "chip-green" : "chip-amber"}`}>
                    <Icon name={c.resolved ? "check" : "alert"} size={14} />
                    {c.resolved ? "Resolved" : "Open"}
                  </span>
                </div>
                <p className="muted">
                  Seal: {SEAL_TEXT[c.seal]} · {timeAgo(c.steps[0].at, now)}
                </p>
                <ComplaintTimeline c={c} now={now} />
              </article>
            ))
          )}
        </section>
      </div>

      {ordering && <OrderSheet restaurantId={restaurant.id} restaurantName={restaurant.name} onClose={() => setOrdering(false)} />}
    </>
  );
}
