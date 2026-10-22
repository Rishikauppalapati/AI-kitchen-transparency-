import ExternalLink from "../ExternalLink";
import { Icon } from "../Icons";
import { DINING_CHECKS, EVIDENCE_LABEL } from "@/lib/checkLabels";
import { formatDay, formatIso } from "@/lib/time";
import type { Restaurant } from "@/lib/types";

// Three states. Raids are always worded "reported". We never write "not fixed".
export default function RaidSection({ restaurant, nowMs }: { restaurant: Restaurant; nowMs: number }) {
  const { raid } = restaurant;

  if (restaurant.raidState === "none" || !raid) {
    return (
      <section className="card block" aria-labelledby="raid-title">
        <h2 id="raid-title">Raid history</h2>
        <p className="state-line state-green">
          <Icon name="check" size={18} /> No raids reported in our sources
        </p>
        <h3>Proof of upkeep</h3>
        <p>
          <strong>{restaurant.streakDays}-day</strong> check-in streak
        </p>
        <ul className="plain-list">
          {DINING_CHECKS.slice(0, 3).map((c) => (
            <li key={c.id}>
              <Icon name="check" size={16} /> {c.label}: passed at the latest check
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="card block" aria-labelledby="raid-title">
      <h2 id="raid-title">Raid history</h2>
      <p className="muted">Reported on {formatIso(raid.reportedOn)}</p>

      <h3>What was reported</h3>
      <ul className="plain-list">
        {raid.reported.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      {restaurant.raidState === "resolved" ? (
        <>
          <h3>Action</h3>
          <p>{raid.action}</p>

          <h3>Fixes recorded</h3>
          <ol className="timeline">
            {raid.fixes.map((f) => (
              <li key={f.date + f.what} className="done">
                <span className="dot" aria-hidden="true">
                  <Icon name="check" size={14} />
                </span>
                <div>
                  <strong>{formatIso(f.date)}</strong>
                  <div>{f.what}</div>
                  <div className="muted">
                    {f.evidence} · Evidence level {f.evidenceLevel} of 3: {EVIDENCE_LABEL[f.evidenceLevel]}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {raid.recheck && (
            <p className="state-line state-green">
              <Icon name="check" size={18} /> {raid.recheck.result}, {formatIso(raid.recheck.date)}
            </p>
          )}
        </>
      ) : (
        <p className="state-line state-grey">
          <Icon name="dash" size={18} /> No follow-up found in our sources as of {formatDay(nowMs)}
        </p>
      )}

      <p className="source">
        <ExternalLink href={raid.sourceUrl}>{raid.sourceLabel}</ExternalLink>
      </p>
    </section>
  );
}
