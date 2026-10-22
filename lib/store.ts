// Saves the latest check per restaurant in this browser (localStorage).
// Good enough for a one-laptop demo; a real database comes later.

import type { StoredCheck } from "./types";

const KEY = "kt-checks-v1";

export type CheckMap = Record<string, StoredCheck>;

export function loadChecks(): CheckMap {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CheckMap) : {};
  } catch {
    return {};
  }
}

export function saveCheck(restaurantId: string, check: StoredCheck): CheckMap {
  const next = { ...loadChecks(), [restaurantId]: check };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked or full: the check still shows this session.
  }
  return next;
}
