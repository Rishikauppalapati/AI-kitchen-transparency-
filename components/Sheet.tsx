"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// A bottom sheet that slides over the phone screen.
// Closes with the X, Escape, or a tap outside. While open, Tab stays inside the sheet,
// and when it closes the focus goes back to the button that opened it.
export default function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Remember what had focus before the sheet opened. This must happen during the first render,
  // because the close button takes focus (autoFocus) before any effect would run.
  const [opener] = useState<HTMLElement | null>(() => (typeof document === "undefined" ? null : (document.activeElement as HTMLElement | null)));
  useEffect(() => {
    const el = sheetRef.current;
    return () => {
      // React's dev mode runs this cleanup once at start-up too; only restore focus if the sheet is really gone.
      setTimeout(() => {
        if (!el?.isConnected) opener?.focus?.();
      }, 0);
    };
  }, [opener]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") return onClose();
    if (e.key !== "Tab" || !sheetRef.current) return;
    const items = [...sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()} onKeyDown={onKeyDown}>
      <div className="sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-label={title}>
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
