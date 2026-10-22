import FreshnessBadge from "../FreshnessBadge";
import { Icon } from "../Icons";
import RaidSection from "./RaidSection";
import { DINING_CHECKS } from "@/lib/checkLabels";
import { diningFreshness, HOUR, timeAgo } from "@/lib/time";
import type { Clock } from "@/lib/useNow";
import type { Restaurant } from "@/lib/types";
import { fakeSnapshots } from "@/data/fakeSnapshots";

export default function KitchenTab({ restaurant, clock }: { restaurant: Restaurant; clock: Clock }) {
  const snap = fakeSnapshots[restaurant.id].dining;
  const verifiedAt = clock.start - snap.hoursAgo * HOUR;
  const hoursSince = (clock.now - verifiedAt) / HOUR;
  const fresh = diningFreshness(hoursSince);

  return (
    <div className="stack">
      <section className="card block" aria-labelledby="kitchen-title">
        <h2 id="kitchen-title" className="sr-only">Kitchen checks</h2>
        <FreshnessBadge freshness={fresh} />
        <p className="big">
          Last verified: <strong>{timeAgo(verifiedAt, clock.now)}</strong>
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
      </section>

      <RaidSection restaurant={restaurant} nowMs={clock.now} />
    </div>
  );
}
