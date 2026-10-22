// A ring showing "done of total". The numbers are also written out, so it never relies on the arc.
export default function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const filled = total === 0 ? 0 : (done / total) * c;

  return (
    <div className="ring" role="img" aria-label={`${done} of ${total} check-ins done today`}>
      <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden="true">
        <circle cx="52" cy="52" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="10" />
        <circle
          cx="52"
          cy="52"
          r={r}
          fill="none"
          stroke="#fff"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
          transform="rotate(-90 52 52)"
        />
      </svg>
      <span className="ring-text" aria-hidden="true">
        <strong>{done}</strong>
        <small>of {total}</small>
      </span>
    </div>
  );
}
