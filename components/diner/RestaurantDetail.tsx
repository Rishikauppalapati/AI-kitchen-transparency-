"use client";

import { useState } from "react";
import AppBar from "../AppBar";
import { Icon } from "../Icons";
import RaidChip from "../RaidChip";
import BookingSheet from "./BookingSheet";
import KitchenTab from "./KitchenTab";
import type { Restaurant } from "@/lib/types";
import type { Clock } from "@/lib/useNow";

type Tab = "kitchen" | "about";

export default function RestaurantDetail({
  restaurant,
  clock,
  onBack,
}: {
  restaurant: Restaurant;
  clock: Clock | null;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<Tab>("kitchen");
  const [booking, setBooking] = useState(false);

  return (
    <>
      <AppBar title="Restaurant" onBack={onBack} />
      <div className="stack">
        <section
          className={`hero tone-${restaurant.tone}`}
          style={{ minHeight: 168, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
        >
          <span className="chip chip-sample" style={{ alignSelf: "flex-start" }}>Sample</span>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.5rem", letterSpacing: "-0.01em" }}>{restaurant.name}</h2>
            <span style={{ fontSize: "0.9rem" }}>
              {restaurant.cuisine} · {restaurant.area}
            </span>
          </div>
        </section>

        <div>
          <RaidChip state={restaurant.raidState} />
        </div>

        <button type="button" className="btn btn-primary full" onClick={() => setBooking(true)} disabled={!clock}>
          <Icon name="dining" size={20} />
          Book a table
        </button>

        <div className="segmented" role="group" aria-label="Restaurant sections">
          {(["kitchen", "about"] as Tab[]).map((t) => (
            <button key={t} type="button" className="seg-btn" aria-pressed={tab === t} onClick={() => setTab(t)}>
              {tab === t && <Icon name="check" size={16} />}
              {t === "kitchen" ? "Kitchen" : "About"}
            </button>
          ))}
        </div>

        {tab === "kitchen" ? (
          clock ? <KitchenTab restaurant={restaurant} clock={clock} /> : <p className="muted">Loading…</p>
        ) : (
          <section className="card block">
            <h2>About</h2>
            <p>{restaurant.cuisine}</p>
            <p className="muted">{restaurant.area}, Hyderabad</p>
            <p className="muted">Open 9:00 AM to 10:30 PM</p>
            <p className="muted">Sample restaurant with made-up data.</p>
          </section>
        )}
      </div>

      {booking && clock && (
        <BookingSheet restaurantName={restaurant.name} startMs={clock.now} onClose={() => setBooking(false)} />
      )}
    </>
  );
}
