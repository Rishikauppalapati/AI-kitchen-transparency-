import AppBar from "../AppBar";
import RaidChip from "../RaidChip";
import type { Restaurant } from "@/lib/types";

export default function DiningList({
  restaurants,
  onOpen,
}: {
  restaurants: Restaurant[];
  onOpen: (id: string) => void;
}) {
  return (
    <>
      <AppBar title="Dining" subtitle="Hyderabad · all restaurants are samples" />
      <div className="stack">
        {restaurants.map((r) => (
          <button key={r.id} type="button" className="card restaurant-card" onClick={() => onOpen(r.id)}>
            <div className={`hero tone-${r.tone}`}>
              <span className="chip chip-sample" style={{ alignSelf: "flex-start" }}>Sample</span>
              <div>
                <h2>{r.name}</h2>
                <span style={{ fontSize: "0.85rem", opacity: 0.95 }}>
                  {r.cuisine} · {r.area}
                </span>
              </div>
            </div>
            <div className="body">
              <RaidChip state={r.raidState} />
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
