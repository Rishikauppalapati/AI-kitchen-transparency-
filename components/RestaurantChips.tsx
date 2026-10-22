import { Icon } from "./Icons";
import type { Restaurant } from "@/lib/types";

// A row of tappable restaurant names, so diner tabs can switch restaurant without the demo panel.
export default function RestaurantChips({
  restaurants,
  selectedId,
  onSelect,
}: {
  restaurants: Restaurant[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="chip-row" role="group" aria-label="Choose a restaurant">
      {restaurants.map((r) => (
        <button
          key={r.id}
          type="button"
          className="pill"
          aria-pressed={r.id === selectedId}
          onClick={() => onSelect(r.id)}
        >
          {r.id === selectedId && <Icon name="check" size={16} />}
          {r.name.replace("Sample ", "")}
        </button>
      ))}
    </div>
  );
}
