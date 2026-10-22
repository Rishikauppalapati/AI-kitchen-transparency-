"use client";

import { useState } from "react";
import { Icon } from "../Icons";
import Sheet from "../Sheet";
import { checkPhoto } from "@/lib/checkPhoto";
import { demoPhotosFor, expectedText } from "@/lib/demoPhotos";
import type { AiResult } from "@/lib/types";

// Take photo and Upload call the real AI (POST /api/check).
// "Use a demo photo" still uses a simulated result until the demo images are added (step 6).
export default function PhotoSheet({
  checkId,
  title,
  showExpected,
  onResult,
  onError,
  onClose,
}: {
  checkId: string;
  title: string;
  showExpected: boolean;
  onResult: (r: AiResult) => void;
  onError: () => void; // the AI or network failed: the tile turns amber
  onClose: () => void;
}) {
  const photos = demoPhotosFor(checkId);
  const [choice, setChoice] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so choosing the same file again still triggers a check
    if (!file) return;
    setProblem(null);
    setBusy(true);
    const outcome = await checkPhoto(checkId, file);
    setBusy(false);

    if (outcome.kind === "result") {
      onResult(outcome.result);
      onClose();
    } else if (outcome.kind === "error") {
      onError();
      onClose();
    } else {
      setProblem(outcome.message); // a bad file: say so, change nothing, keep the sheet open
    }
  }

  function useDemo() {
    const photo = photos.find((p) => p.name === choice);
    if (photo) {
      onResult(photo.expected);
      onClose();
    }
  }

  return (
    <Sheet title={title} onClose={onClose}>
      <div className="photo-options">
        <label className="btn btn-primary file-btn" aria-disabled={busy}>
          <Icon name="camera" size={20} />
          Take photo
          <input type="file" accept="image/*" capture="environment" onChange={onFile} disabled={busy} />
        </label>
        <label className="btn btn-outline file-btn" aria-disabled={busy}>
          <Icon name="upload" size={20} />
          Upload
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} disabled={busy} />
        </label>
      </div>

      <div role="status" aria-live="polite">
        {busy && <p className="muted">Checking the photo… this takes a few seconds.</p>}
        {problem && (
          <p className="form-error" role="alert">
            <Icon name="alert" size={16} /> {problem}
          </p>
        )}
      </div>

      <label className="field-label" htmlFor="demo-photo">Use a demo photo</label>
      <select id="demo-photo" className="select" value={choice} onChange={(e) => setChoice(e.target.value)} disabled={busy}>
        <option value="">Choose a demo photo</option>
        {photos.map((p) => (
          <option key={p.name} value={p.name}>
            {p.label}
            {showExpected ? ` (${expectedText(p.expected)})` : ""}
          </option>
        ))}
      </select>
      <p className="chip chip-grey" style={{ marginTop: 10 }}>
        Demo photos give a simulated result (no AI call)
      </p>

      <button type="button" className="btn btn-primary full" style={{ marginTop: 14 }} disabled={!choice || busy} onClick={useDemo}>
        Use this demo photo
      </button>
    </Sheet>
  );
}
