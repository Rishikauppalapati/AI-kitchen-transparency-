import AppBar from "../AppBar";
import ComingSoon from "../ComingSoon";
import { Icon } from "../Icons";
import type { ManagerTab, Restaurant } from "@/lib/types";

export default function ManagerHome({
  restaurant,
  onGo,
}: {
  restaurant: Restaurant;
  onGo: (tab: ManagerTab) => void;
}) {
  return (
    <>
      <AppBar title="Good morning" subtitle={`${restaurant.name} · manager view`} />
      <div className="stack">
        <section className="hero" aria-label="Today">
          <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>Today&apos;s check-ins</p>
          <p style={{ margin: "4px 0 14px", fontSize: "0.9rem" }}>Start with the kitchen photos. Diners see the result once you sign off.</p>
          <button type="button" className="btn btn-light on-dark" onClick={() => onGo("dining")}>
            Start dining check
            <Icon name="chevron" size={18} />
          </button>
        </section>

        <div className="tile-grid">
          <button type="button" className="tile" onClick={() => onGo("dining")}>
            <span className="tile-icon"><Icon name="dining" /></span>
            <span>
              Dining check
              <small>6 checks</small>
            </span>
          </button>
          <button type="button" className="tile" onClick={() => onGo("delivery")}>
            <span className="tile-icon"><Icon name="delivery" /></span>
            <span>
              Delivery check
              <small>3 layers</small>
            </span>
          </button>
        </div>

        <ComingSoon
          icon="home"
          title="Progress ring, schedule and streak"
          step={3}
          items={[
            "x of 7 check-ins today",
            "Today's schedule for dining and delivery",
            "Streak and Flagged for review",
          ]}
        />
      </div>
    </>
  );
}
