// The app's logo, centred at the top of every screen: a smiling pot with its lid popped up and a tick rising
// like steam, next to a tilted "Clear" label and "Kitchen". The words are real text; the whole thing reads as
// "Clear Kitchen" to a screen reader.
export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      {/* pot handles and body */}
      <rect x="2.5" y="22" width="7" height="4.5" rx="2.25" fill="#134e4a" />
      <rect x="30.5" y="22" width="7" height="4.5" rx="2.25" fill="#134e4a" />
      <path d="M7 21h26v8a6 6 0 0 1-6 6H13a6 6 0 0 1-6-6z" fill="#0f766e" />
      {/* lid, popped up and tilted */}
      <g transform="rotate(-9 20 18)">
        <path d="M8.5 19a11.5 5 0 0 1 23 0z" fill="#134e4a" />
        <circle cx="20" cy="11.8" r="2.2" fill="#134e4a" />
      </g>
      {/* the tick that rises like steam */}
      <path d="M25 13.5l3.6 3.6L35 7" fill="none" stroke="#92400e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* a sparkle */}
      <path d="M7 3.5l1.3 3 3 1.3-3 1.3L7 12.1l-1.3-3-3-1.3 3-1.3z" fill="#f59e0b" />
      {/* a happy face */}
      <circle cx="15.5" cy="27" r="1.5" fill="#fff" />
      <circle cx="24.5" cy="27" r="1.5" fill="#fff" />
      <path d="M16.5 30.5q3.5 3 7 0" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Brand() {
  return (
    <div className="brandbar">
      <div className="brand" role="img" aria-label="Clear Kitchen">
        <BrandMark />
        <span className="brand-word" aria-hidden="true">
          <span className="brand-clear">Clear</span>
          <span className="brand-kitchen">Kitchen</span>
        </span>
      </div>
    </div>
  );
}
