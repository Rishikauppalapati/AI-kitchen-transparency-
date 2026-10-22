"use client";

import { useState } from "react";
import { Icon } from "../Icons";
import Sheet from "../Sheet";
import { DAY } from "@/lib/time";

const TIMES = ["12:30 PM", "1:00 PM", "1:30 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"];

function dayLabel(ms: number, index: number): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return new Date(ms).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}

// Entirely fake: nothing is booked anywhere.
export default function BookingSheet({
  restaurantName,
  startMs,
  onClose,
}: {
  restaurantName: string;
  startMs: number;
  onClose: () => void;
}) {
  const [dayIndex, setDayIndex] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [done, setDone] = useState(false);

  const days = Array.from({ length: 7 }, (_, i) => startMs + i * DAY);

  if (done && dayIndex !== null && time) {
    return (
      <Sheet title="Booking confirmed" onClose={onClose}>
        <div className="success">
          <span className="success-icon" aria-hidden="true">
            <Icon name="check" size={32} />
          </span>
          <h3>You&apos;re booked (demo)</h3>
          <p>
            {restaurantName}
            <br />
            {dayLabel(days[dayIndex], dayIndex)} at {time} · {guests} {guests === 1 ? "guest" : "guests"}
          </p>
          <p className="muted">This is a demo. Nothing was actually booked.</p>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title="Book a table" onClose={onClose}>
      <span className="field-label" id="book-date">Date</span>
      <div className="chip-row" role="group" aria-labelledby="book-date">
        {days.map((d, i) => (
          <button key={d} type="button" className="pill" aria-pressed={dayIndex === i} onClick={() => setDayIndex(i)}>
            {dayIndex === i && <Icon name="check" size={16} />}
            {dayLabel(d, i)}
          </button>
        ))}
      </div>

      <span className="field-label" id="book-time">Time</span>
      <div className="chip-wrap" role="group" aria-labelledby="book-time">
        {TIMES.map((t) => (
          <button key={t} type="button" className="pill" aria-pressed={time === t} onClick={() => setTime(t)}>
            {time === t && <Icon name="check" size={16} />}
            {t}
          </button>
        ))}
      </div>

      <span className="field-label" id="book-guests">Guests</span>
      <div className="stepper" role="group" aria-labelledby="book-guests">
        <button type="button" className="icon-btn" aria-label="Fewer guests" disabled={guests <= 1} onClick={() => setGuests((g) => g - 1)}>
          <Icon name="dash" />
        </button>
        <output aria-live="polite">{guests}</output>
        <button type="button" className="icon-btn" aria-label="More guests" disabled={guests >= 10} onClick={() => setGuests((g) => g + 1)}>
          <Icon name="plus" />
        </button>
      </div>

      <button
        type="button"
        className="btn btn-primary full"
        disabled={dayIndex === null || !time}
        onClick={() => setDone(true)}
        style={{ marginTop: 20 }}
      >
        Confirm booking
      </button>
      {(dayIndex === null || !time) && <p className="muted center">Pick a date and a time to continue.</p>}
    </Sheet>
  );
}
