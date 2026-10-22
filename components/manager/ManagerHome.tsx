import AppBar from "../AppBar";
import { Icon } from "../Icons";
import ProgressRing from "./ProgressRing";
import { FLAGGED, SCHEDULE } from "@/data/managerFake";
import type { ManagerTab, Restaurant } from "@/lib/types";

export default function ManagerHome({
  restaurant,
  onGo,
  onPreview,
}: {
  restaurant: Restaurant;
  onGo: (tab: ManagerTab) => void;
  onPreview: () => void;
}) {
  const done = SCHEDULE.filter((s) => s.done).length;
  const flagged = FLAGGED[restaurant.id] ?? [];
  const next = SCHEDULE.find((s) => !s.done);

  return (
    <>
      <AppBar title="Good morning" subtitle={`${restaurant.name} · manager view`} />
      <div className="stack">
        <section className="hero ring-hero" aria-label="Today's progress">
          <ProgressRing done={done} total={SCHEDULE.length} />
          <div>
            <p className="ring-title">Check-ins today</p>
            <p className="ring-sub">
              {done} of {SCHEDULE.length} done
            </p>
            <p className="ring-sub">
              <Icon name={restaurant.streakDays > 0 ? "check" : "dash"} size={14} />{" "}
              {restaurant.streakDays > 0 ? `${restaurant.streakDays}-day streak` : "No streak yet"}
            </p>
          </div>
        </section>

        {next && (
          <section className="notif" aria-label="Next check-in">
            <span className="notif-icon" aria-hidden="true">
              <Icon name="bell" />
            </span>
            <div className="grow">
              <strong>{next.label}</strong>
              <div className="muted">Due {next.when}</div>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => onGo(next.kind === "dining" ? "dining" : "delivery")}>
              Start
            </button>
          </section>
        )}

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

        <section className="card block" aria-labelledby="schedule-title">
          <h2 id="schedule-title">Today&apos;s schedule</h2>
          <ul className="schedule">
            {SCHEDULE.map((s) => (
              <li key={s.id} className={s.done ? "is-done" : ""}>
                <span className="tick" aria-hidden="true">
                  <Icon name={s.done ? "check" : "clock"} size={16} />
                </span>
                <span className="grow">
                  {s.label}
                  <span className="muted" style={{ display: "block" }}>{s.when}</span>
                </span>
                <span className={`chip ${s.done ? "chip-green" : "chip-grey"}`}>{s.done ? "Done" : "To do"}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card block" aria-labelledby="flag-title">
          <h2 id="flag-title">Flagged for review</h2>
          {flagged.length === 0 ? (
            <p className="state-line state-green">
              <Icon name="check" size={18} /> Nothing flagged
            </p>
          ) : (
            <>
              <p className="state-line" style={{ background: "var(--amber-bg)", color: "var(--amber-text)" }}>
                <Icon name="alert" size={18} /> {flagged.join(", ")}: retaken 3 or more times
              </p>
              <p className="muted">Only you see this. Diners never see flags.</p>
            </>
          )}
        </section>

        <button type="button" className="btn btn-outline full" onClick={onPreview}>
          <Icon name="eye" size={20} />
          Preview what diners see
        </button>
      </div>
    </>
  );
}
