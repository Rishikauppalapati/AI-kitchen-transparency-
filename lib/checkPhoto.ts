// Browser side of a photo check: tidy the photo, send it to /api/check, sort out the answer.

import { shrinkImage } from "./image";
import { MAX_RAW_BYTES, validateImage } from "./rules";
import type { AiResult } from "./types";

export type Outcome =
  | { kind: "result"; result: AiResult }
  | { kind: "invalid"; message: string } // the file is the problem: nothing changes
  | { kind: "error"; message: string; retryAfterSeconds?: number }; // the AI or network failed: the tile turns amber

export async function checkPhoto(checkId: string, file: File): Promise<Outcome> {
  const problem = validateImage(file, MAX_RAW_BYTES);
  if (problem) return { kind: "invalid", message: problem };

  let small: File;
  try {
    small = await shrinkImage(file);
  } catch {
    return { kind: "invalid", message: "We couldn't open that file as a picture. Please choose a different photo." };
  }

  // The AI service is sometimes busy or slow. A busy AI must never look like a rejected photo, so if the first
  // try fails because of the service (not because of the photo), quietly try once more before giving up.
  const first = await send(checkId, small);
  if (first.kind !== "error" || first.retryAfterSeconds) return first; // a usage limit won't lift in a second, so don't retry at once
  await new Promise((resolve) => setTimeout(resolve, 800));
  return send(checkId, small);
}

async function send(checkId: string, photo: File): Promise<Outcome> {
  const form = new FormData();
  form.set("checkId", checkId);
  form.set("photo", photo);

  try {
    const res = await fetch("/api/check", { method: "POST", body: form, signal: AbortSignal.timeout(25_000) });
    const body = (await res.json()) as
      | { ok: true; result: AiResult }
      | { ok: false; kind: "invalid" | "ai"; message: string; retryAfterSeconds?: number };
    if (body.ok) return { kind: "result", result: body.result };
    if (body.kind === "invalid") return { kind: "invalid", message: body.message };
    return { kind: "error", message: body.message, retryAfterSeconds: body.retryAfterSeconds };
  } catch {
    return { kind: "error", message: "We couldn't reach the server. Check your connection and try again." };
  }
}
