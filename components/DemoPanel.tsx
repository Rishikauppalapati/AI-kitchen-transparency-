"use client";

import { useState } from "react";
import { Icon } from "./Icons";
import Sheet from "./Sheet";
import type { Restaurant, Role } from "@/lib/types";

// Version for steps 1 to 3: role switch and restaurant picker only.
// The demo clock, notification triggers and Reset demo arrive in step 4.
export default function DemoPanel({
  role,
  onRole,
  restaurants,
  restaurantId,
  onRestaurant,
}: {
  role: Role;
  onRole: (r: Role) => void;
  restaurants: Restaurant[];
  restaurantId: string;
  onRestaurant: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="demo-fab on-dark"
        onClick={() => setOpen(true)}
        aria-label="Open demo controls"
      >
        <Icon name="sliders" />
      </button>

      {open && (
        <Sheet title="Demo controls" onClose={() => setOpen(false)}>
          <span className="field-label" id="role-label">Who are you?</span>
          <div className="segmented" role="group" aria-labelledby="role-label">
            {(["diner", "manager"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                className="seg-btn"
                aria-pressed={role === r}
                onClick={() => onRole(r)}
              >
                {role === r && <Icon name="check" size={16} />}
                {r === "diner" ? "Diner" : "Manager"}
              </button>
            ))}
          </div>

          <label className="field-label" htmlFor="restaurant-select">Restaurant</label>
          <select
            id="restaurant-select"
            className="select"
            value={restaurantId}
            onChange={(e) => onRestaurant(e.target.value)}
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <p className="muted" style={{ marginTop: 16 }}>
            More controls (demo clock, notifications, expected AI result, Reset demo) arrive in step 4.
          </p>
        </Sheet>
      )}
    </>
  );
}
