"use client";

import { useState } from "react";
import { Icon } from "../Icons";
import Sheet from "../Sheet";
import { useApp } from "@/lib/AppState";
import type { Notice } from "@/lib/state";
import { timeAgo } from "@/lib/time";

// The newest unread reminder slides in at the top with a Start button.
export function NotificationBanner({ restaurantId, onStart }: { restaurantId: string; onStart: (n: Notice) => void }) {
  const { data, act } = useApp();
  const n = data.restaurants[restaurantId].notices.find((x) => x.banner && !x.read);
  if (!n) return null;

  return (
    <div className="banner" role="status" key={n.id}>
      <span className="notif-icon" aria-hidden="true">
        <Icon name="bell" />
      </span>
      <div className="grow">
        <strong>{n.title}</strong>
        <div className="muted">{n.body}</div>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          act({ type: "readNotice", rid: restaurantId, id: n.id });
          onStart(n);
        }}
      >
        Start
      </button>
      <button
        type="button"
        className="icon-btn"
        aria-label="Dismiss notification"
        onClick={() => act({ type: "dismissBanner", rid: restaurantId, id: n.id })}
      >
        <Icon name="close" />
      </button>
    </div>
  );
}

// The bell, with an unread count, and the list of every reminder.
export function NotificationBell({ restaurantId, onStart }: { restaurantId: string; onStart: (n: Notice) => void }) {
  const { data, now, act } = useApp();
  const [open, setOpen] = useState(false);
  const [fresh, setFresh] = useState<Set<string>>(new Set()); // which were unread when the list opened

  const notices = data.restaurants[restaurantId].notices;
  const unread = notices.filter((n) => !n.read).length;

  function openList() {
    setFresh(new Set(notices.filter((n) => !n.read).map((n) => n.id)));
    act({ type: "readAllNotices", rid: restaurantId });
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        className="icon-btn bell"
        onClick={openList}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications, none unread"}
      >
        <Icon name="bell" />
        {unread > 0 && (
          <span className="badge" aria-hidden="true">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <Sheet title="Notifications" onClose={() => setOpen(false)}>
          {notices.length === 0 ? (
            <p className="muted">Nothing yet. Reminders appear here at 8:30 AM, 9:00 AM and so on, or use the demo controls to trigger one.</p>
          ) : (
            <ul className="notice-list">
              {notices.map((n) => (
                <li key={n.id}>
                  <div className="grow">
                    <strong>{n.title}</strong>
                    {fresh.has(n.id) && <span className="chip chip-green new-chip">New</span>}
                    <div className="muted">{n.body}</div>
                    <div className="muted">{timeAgo(n.at, now)}</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setOpen(false);
                      onStart(n);
                    }}
                  >
                    Start
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Sheet>
      )}
    </>
  );
}
