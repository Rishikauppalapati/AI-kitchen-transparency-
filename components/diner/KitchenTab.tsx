import FreshnessBadge from "../FreshnessBadge";
import { Icon } from "../Icons";
import RaidSection from "./RaidSection";
import { DINING_CHECKS } from "@/lib/checkLabels";
import { useApp } from "@/lib/AppState";
import { diningFreshness, HOUR, timeAgo, type Freshness } from "@/lib/time";
import type { Restaurant } from "@/lib/types";

const NEVER: Freshness = { tone: "grey", label: "Not verified yet", stale: true };

// The diner reads ONLY the published snapshot, never the manager's draft.
export default function KitchenTab({ restaurant }: { restaurant: Restaurant }) {
  const { data, now } = useApp();
  const snap = data.restaurants[restaurant.id].diningSnapshot;
  const fresh = snap ? diningFreshness((now - snap.verifiedAt) / HOUR) : NEVER;

  return (
    <div className="stack">
      <section className="card block" aria-labelledby="kitchen-title">
        <h2 id="kitchen-title" className="sr-only">Kitchen checks</h2>
        <FreshnessBadge freshness={fresh} />

        {snap ? (
          <>
            <p className="big">
              Last verified: <strong>{timeAgo(snap.verifiedAt, now)}</strong>
            </p>
            <p className="muted">Evidence level 1 of 3: photo</p>

            <h3>{fresh.stale ? "Last known checks" : "Today's checks"}</h3>
            <ul className={`check-list ${fresh.stale ? "is-stale" : ""}`}>
              {DINING_CHECKS.map((c) => (
                <li key={c.id}>
                  <span className="tick" aria-hidden="true">
                    <Icon name="check" size={16} />
                  </span>
                  <span className="grow">{c.label}</span>
                  {c.id === "fridge" ? (
                    <span className="reading">{snap.fridgeC.toFixed(1)}°C</span>
                  ) : (
                    <span className="sr-only">passed</span>
                  )}
                  {fresh.stale && <span className="chip chip-grey">Last known</span>}
                </li>
              ))}
            </ul>
            <p className="label-tag">Self-reported, AI-checked</p>
          </>
        ) : (
          <p className="muted" style={{ marginTop: 12 }}>
            This kitchen has not completed a full check yet.
          </p>
        )}
      </section>

      <RaidSection restaurant={restaurant} nowMs={now} />
    </div>
  );
}
