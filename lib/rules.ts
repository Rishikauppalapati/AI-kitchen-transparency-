// Plain-code rules. No AI in this file: these decisions must be predictable.

import type { AiResult, TileState } from "./types";

export const DEMO_OTP = "1234";

// Demo threshold for the fridge reading. Cold storage at 5°C or below is the common rule,
// but check the exact limit with FSSAI (or a FoSTaC trainer) before real use.
export const FRIDGE_MAX_C = 5;

export const TODO: TileState = { state: "todo" };

export function parseTemperature(input: string): number | null {
  const value = Number(input.trim().replace(",", "."));
  if (input.trim() === "" || !Number.isFinite(value) || value < -30 || value > 30) return null;
  return value;
}

// The fridge tile is judged by code, not AI: pass at 5°C or lower, otherwise amber.
export function fridgeTile(celsius: number): TileState {
  if (celsius <= FRIDGE_MAX_C) return { state: "checked", note: `${celsius.toFixed(1)}°C` };
  return { state: "retake", note: `${celsius.toFixed(1)}°C is above ${FRIDGE_MAX_C}°C` };
}

// Rule 1: only a clear pass turns a tile green. Fail, "cannot tell", "photo doesn't
// show this" (and, later, an AI error) all turn it amber with a short note.
export function tileFromAi(result: AiResult): TileState {
  if (result.relevant && result.status === "pass") return { state: "checked", note: result.note };
  if (!result.relevant) return { state: "retake", note: "Photo doesn't show this" };
  if (result.status === "cannot_tell") return { state: "retake", note: result.note || "Can't tell from this photo" };
  return { state: "retake", note: result.note };
}

export function allChecked(tiles: TileState[]): boolean {
  return tiles.length > 0 && tiles.every((t) => t.state === "checked");
}
