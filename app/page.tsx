"use client";

import { useEffect, useState } from "react";
import KitchenPage from "@/components/KitchenPage";
import ManagerCheckin from "@/components/ManagerCheckin";
import restaurantData from "@/data/restaurants.json";
import { loadChecks, saveCheck, type CheckMap } from "@/lib/store";
import type { Restaurant, StoredCheck } from "@/lib/types";

const restaurants = restaurantData as Restaurant[];

export default function Home() {
  const [restaurantId, setRestaurantId] = useState(restaurants[0].id);
  // Checks saved in this browser by earlier check-ins, filled in after the page loads.
  const [saved, setSaved] = useState<CheckMap>({});

  useEffect(() => {
    // localStorage only exists in the browser, so we read it after the first render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(loadChecks());
  }, []);

  const restaurant = restaurants.find((r) => r.id === restaurantId) ?? restaurants[0];
  const check = saved[restaurant.id] ?? restaurant.seedCheck;

  function handleVerified(newCheck: StoredCheck) {
    setSaved(saveCheck(restaurant.id, newCheck));
  }

  return (
    <main>
      <header>
        <h1>Kitchen Transparency</h1>
        <p className="muted">
          Sample data. Restaurants shown here are made up for the demo.
        </p>
        <label className="field picker">
          <span>Restaurant</span>
          <select value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)}>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="split">
        <ManagerCheckin
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          onVerified={handleVerified}
        />
        <KitchenPage restaurant={restaurant} check={check} />
      </div>
    </main>
  );
}
