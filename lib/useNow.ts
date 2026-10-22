"use client";

import { useEffect, useState } from "react";

export interface Clock {
  now: number; // current time, refreshed every 30 seconds
  start: number; // when the page loaded: fake data is placed relative to this
}

// Starts as null so the server-rendered page never reads the time.
// Step 4 replaces this with the demo clock (real time plus an offset).
export function useNow(): Clock | null {
  const [clock, setClock] = useState<Clock | null>(null);

  useEffect(() => {
    const start = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClock({ now: start, start });
    const id = setInterval(() => setClock((c) => (c ? { ...c, now: Date.now() } : c)), 30_000);
    return () => clearInterval(id);
  }, []);

  return clock;
}
