import type { Raid } from "@/lib/types";

// Hidden completely when the restaurant has never been flagged.
export default function RaidTimeline({ raids }: { raids: Raid[] }) {
  if (raids.length === 0) return null;

  return (
    <section className="timeline" aria-labelledby="timeline-title">
      <h3 id="timeline-title">Past raid and fixes</h3>
      {raids.map((raid) => (
        <article key={raid.date} className="raid">
          <p className="raid-date">Reported on {raid.date}</p>
          <ul>
            {raid.reported.map((item) => (
              <li key={item}>Reported: {item}</li>
            ))}
          </ul>
          <p>
            <a href={raid.sourceUrl} target="_blank" rel="noopener noreferrer">
              {raid.sourceLabel}
            </a>
          </p>

          <h4>Fixes reported by the restaurant</h4>
          {raid.fixes.length === 0 ? (
            <p className="no-followup">No follow-up found in our sources.</p>
          ) : (
            <ul className="fixes">
              {raid.fixes.map((fix) => (
                <li key={fix.date + fix.what}>
                  <strong>{fix.date}:</strong> {fix.what}
                  <br />
                  <span className="muted">Proof: {fix.proof}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  );
}
