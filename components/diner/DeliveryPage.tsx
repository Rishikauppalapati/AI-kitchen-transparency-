"use client";

import { useState } from "react";
import AppBar from "../AppBar";
import FreshnessBadge from "../FreshnessBadge";
import { Icon } from "../Icons";
import RestaurantChips from "../RestaurantChips";
import OrderSheet from "./OrderSheet";
import { deliveryFreshness, HOUR, DAY, timeAgo } from "@/lib/time";
import type { Clock } from "@/lib/useNow";
import type { Restaurant } from "@/lib/types";
import { fakeSnapshots, type FakeComplaint } from "@/data/fakeSnapshots";

function Complaint({ c, clock }: { c: FakeComplaint; clock: Clock }) {
  return (
    <article className="complaint">
      <div className="complaint-head">
        <strong>{c.category}</strong>
        <span className={`chip ${c.resolved ? "chip-green" : "chip-amber"}`}>
          <Icon name={c.resolved ? "check" : "alert"} size={14} />
          {c.resolved ? "Resolved" : "Open"}
        </span>
      </div>
      <p className="muted">
        Seal: {c.seal === "intact" ? "intact" : c.seal === "broken" ? "reported broken" : "not sure"} ·{" "}
        {timeAgo(clock.start - c.daysAgo * DAY, clock.now)}
      </p>
      <ol className="timeline">
        {c.steps.map((s) => (
          <li key={s.label} className="done">
            <span className="dot" aria-hidden="true">
              <Icon name="check" size={14} />
            </span>
            <div>
              {s.label}
              <div className="muted">{timeAgo(clock.start - s.daysAgo * DAY, clock.now)}</div>
            </div>
          </li>
        ))}
        {c.pending && (
          <li>
            <span className="dot pending" aria-hidden="true" />
            <div>{c.pending}</div>
          </li>
        )}
      </ol>
    </article>
  );
}

export default function DeliveryPage({
  restaurants,
  restaurant,
  onSelect,
  clock,
}: {
  restaurants: Restaurant[];
  restaurant: Restaurant;
  onSelect: (id: string) => void;
  clock: Clock | null;
}) {
  const [ordering, setOrdering] = useState(false);

  return (
    <>
      <AppBar title="Delivery" subtitle={`${restaurant.name} · kitchen proof`} />
      <div className="stack">
        <RestaurantChips restaurants={restaurants} selectedId={restaurant.id} onSelect={onSelect} />

        {!clock ? (
          <p className="muted">Loading…</p>
        ) : (
          (() => {
            const snap = fakeSnapshots[restaurant.id].delivery;
            const verifiedAt = clock.start - snap.hoursAgo * HOUR;
            const fresh = deliveryFreshness((clock.now - verifiedAt) / HOUR);
            const passed = snap.packChecksPassed;
            return (
              <>
                <section className="card block" aria-labelledby="delivery-proof">
                  <h2 id="delivery-proof" className="sr-only">Delivery kitchen proof</h2>
                  <FreshnessBadge freshness={fresh} />
                  <p className="big">
                    Last verified: <strong>{timeAgo(verifiedAt, clock.now)}</strong>
                  </p>

                  <h3>Pack checks today</h3>
                  <div className="dots" role="img" aria-label={`${passed} of 3 pack checks passed today`}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={`pack-dot ${i < passed ? "on" : ""}`}>
                        {i < passed ? <Icon name="check" size={16} /> : i + 1}
                      </span>
                    ))}
                    <span className="grow">
                      <strong>{passed} of 3</strong> passed
                    </span>
                  </div>

                  <ul className="check-list" style={{ marginTop: 12 }}>
                    <li>
                      <span className="tick" aria-hidden="true"><Icon name="check" size={16} /></span>
                      <span className="grow">{snap.hotColdApart ? "Hot and cold kept apart" : "Hot and cold not confirmed"}</span>
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
                  <p className="label-tag">Self-reported, AI-checked</p>
                </section>

                <button type="button" className="btn btn-primary full" onClick={() => setOrdering(true)}>
                  <Icon name="bag" size={20} />
                  Order now
                </button>

                <section className="card block" aria-labelledby="complaints-title">
                  <h2 id="complaints-title">Complaints, last 30 days</h2>
                  {snap.complaints.length === 0 ? (
                    <p className="state-line state-green">
                      <Icon name="check" size={18} /> No complaints in the last 30 days
                    </p>
                  ) : (
                    snap.complaints.map((c) => <Complaint key={c.id} c={c} clock={clock} />)
                  )}
                </section>
              </>
            );
          })()
        )}
      </div>

      {ordering && <OrderSheet restaurantId={restaurant.id} restaurantName={restaurant.name} onClose={() => setOrdering(false)} />}
    </>
  );
}
