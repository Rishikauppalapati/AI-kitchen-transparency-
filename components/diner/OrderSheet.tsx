"use client";

import { useState } from "react";
import { Icon } from "../Icons";
import Sheet from "../Sheet";
import { menus } from "@/data/menus";

// Entirely fake: nothing is ordered or paid for.
export default function OrderSheet({
  restaurantId,
  restaurantName,
  onClose,
}: {
  restaurantId: string;
  restaurantName: string;
  onClose: () => void;
}) {
  const items = menus[restaurantId] ?? [];
  const [qty, setQty] = useState<Record<string, number>>({});
  const [placed, setPlaced] = useState(false);

  const change = (id: string, d: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(9, (q[id] ?? 0) + d)) }));
  const count = items.reduce((n, i) => n + (qty[i.id] ?? 0), 0);
  const total = items.reduce((sum, i) => sum + (qty[i.id] ?? 0) * i.price, 0);

  if (placed) {
    return (
      <Sheet title="Order placed" onClose={onClose}>
        <div className="success">
          <span className="success-icon" aria-hidden="true">
            <Icon name="check" size={32} />
          </span>
          <h3>Order placed (demo)</h3>
          <p>
            {restaurantName}
            <br />
            {count} {count === 1 ? "item" : "items"} · ₹{total}
          </p>
          <p className="muted">This is a demo. Nothing was ordered or charged.</p>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title="Order now" onClose={onClose}>
      <p className="muted">{restaurantName} · sample menu</p>
      <ul className="menu-list">
        {items.map((i) => (
          <li key={i.id}>
            <div className="grow">
              <strong>{i.name}</strong>
              <div className="muted">₹{i.price}</div>
            </div>
            <div className="stepper">
              <button type="button" className="icon-btn" aria-label={`Remove one ${i.name}`} disabled={!qty[i.id]} onClick={() => change(i.id, -1)}>
                <Icon name="dash" />
              </button>
              <output aria-live="polite">{qty[i.id] ?? 0}</output>
              <button type="button" className="icon-btn" aria-label={`Add one ${i.name}`} onClick={() => change(i.id, 1)}>
                <Icon name="plus" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button type="button" className="btn btn-primary full" disabled={count === 0} onClick={() => setPlaced(true)}>
        {count === 0 ? "Add items to order" : `Place order · ₹${total}`}
      </button>
    </Sheet>
  );
}
