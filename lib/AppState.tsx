"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import PhoneFrame from "@/components/PhoneFrame";
import { reducer, seedData, VERSION, type Action, type ActionInput, type AppData } from "./state";

const KEY = "kt-data-v1";

interface Ctx {
  data: AppData;
  now: number; // the demo clock: real time plus the fast-forward offset
  act: (a: ActionInput) => void;
  reset: () => void;
}

const AppContext = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

function load(): AppData | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppData;
    return parsed.version === VERSION && parsed.restaurants ? parsed : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(reducer, null);
  const [real, setReal] = useState<number | null>(null);
  const offset = useRef(0); // latest clock offset, readable from timers and event handlers
  useEffect(() => {
    offset.current = data?.clockOffset ?? 0;
  }, [data]);

  // Start: load saved data, or seed fresh demo data relative to the real time now.
  useEffect(() => {
    const t = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReal(t);
    dispatch({ type: "reset", data: load() ?? seedData(t), now: t });
  }, []);

  // Save after every change.
  useEffect(() => {
    if (!data) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // Storage full or blocked: the demo still works until you refresh.
    }
  }, [data]);

  // Keep the clock moving. Tick every second while a pack check is counting down, else every 10 s.
  const counting = !!data && Object.values(data.restaurants).some((r) => r.packPendingSince !== null);
  useEffect(() => {
    if (!data) return;
    const id = setInterval(
      () => {
        const t = Date.now();
        setReal(t);
        dispatch({ type: "tickPack", now: t + offset.current });
      },
      counting ? 1000 : 10_000,
    );
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counting, data === null]);

  const act = useCallback((a: ActionInput) => {
    const t = Date.now();
    setReal(t);
    dispatch({ ...a, now: t + offset.current } as Action);
  }, []);

  const reset = useCallback(() => {
    const t = Date.now();
    setReal(t);
    dispatch({ type: "reset", data: seedData(t), now: t });
  }, []);

  if (!data || real === null) {
    return (
      <PhoneFrame>
        <main className="screen" aria-busy="true" aria-label="Loading" />
      </PhoneFrame>
    );
  }

  return <AppContext.Provider value={{ data, now: real + data.clockOffset, act, reset }}>{children}</AppContext.Provider>;
}
