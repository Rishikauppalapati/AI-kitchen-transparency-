"use client";

import { Icon } from "./Icons";

// A bottom sheet that slides over the phone screen. Closes with the X, Escape, or a tap outside.
export default function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="sheet-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={`Close ${title}`} autoFocus>
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
