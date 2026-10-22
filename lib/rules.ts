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

// An AI or network failure also turns the tile amber with a Retake button (rule 1).
export function errorTile(): TileState {
  return { state: "retake", note: "Couldn't check, try again", error: true };
}

// ---------- Uploads and AI replies (shared by the browser and the server) ----------

export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // the server limit (Vercel allows 4.5 MB per request)
export const MAX_RAW_BYTES = 25 * 1024 * 1024; // the biggest original we'll even try to shrink

export function validateImage(file: { type: string; size: number }, maxBytes: number): string | null {
  if (file.size === 0) return "That photo is empty. Please choose another one.";
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "That file isn't a photo we can read. Please use a JPG, PNG or WebP picture.";
  }
  if (file.size > maxBytes) return "That photo is too large. Please take a smaller one.";
  return null;
}

// Check the first bytes, so a PDF renamed to .jpg is still rejected.
export function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

const STATUSES = ["pass", "fail", "cannot_tell"];

// Never trust the model's JSON: check every field, shorten the note to 12 words.
export function parseAiResult(raw: unknown): AiResult | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.relevant !== "boolean" || typeof r.status !== "string" || !STATUSES.includes(r.status)) return null;
  if (typeof r.note !== "string") return null;

  const words = r.note.trim().split(/\s+/).filter(Boolean).slice(0, 12);
  let status = r.status as AiResult["status"];
  let note = words.join(" ");

  if (!r.relevant) {
    status = "cannot_tell"; // if the photo doesn't show it, we can never pass or fail it
    note = "Photo doesn't show this";
  } else if (!note) {
    note = status === "pass" ? "Clearly satisfied" : status === "fail" ? "Not satisfied" : "Can't tell from this photo";
  }
  return { relevant: r.relevant, status, note };
}

export function allChecked(tiles: TileState[]): boolean {
  return tiles.length > 0 && tiles.every((t) => t.state === "checked");
}
