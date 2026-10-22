"use client";

import { useEffect, useState } from "react";
import { Icon } from "../Icons";
import Sheet from "../Sheet";
import { checkPhoto } from "@/lib/checkPhoto";
import { demoPath, demoPhotoExists, demoPhotosFor, demoUrl, expectedText, loadDemoPhoto, type DemoPhoto } from "@/lib/demoPhotos";
import type { AiResult } from "@/lib/types";

// Take photo, Upload and a demo photo all go through the same real AI check (POST /api/check).
// If a demo photo's file isn't in public/demo/ yet, the sheet says which file to add,
// and offers its expected result as a clearly labelled simulation instead.
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
  const [missing, setMissing] = useState<DemoPhoto | null>(null);
  const [available, setAvailable] = useState<Record<string, boolean>>({}); // which demo files exist

  // Find out which demo files exist, so the list can say which are missing.
  useEffect(() => {
    let cancelled = false;
    Promise.all(photos.map(async (p) => [p.name, await demoPhotoExists(p.name)] as const)).then((pairs) => {
      if (!cancelled) setAvailable(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkId]);

  async function run(file: File) {
    setProblem(null);
    setMissing(null);
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

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so choosing the same file again still triggers a check
    if (file) await run(file);
  }

  async function useDemo() {
    const photo = photos.find((p) => p.name === choice);
    if (!photo) return;
    setProblem(null);
    setMissing(null);
    setBusy(true);
    const file = await loadDemoPhoto(photo.name);
    setBusy(false);
    if (!file) return setMissing(photo); // not added yet: say so, don't crash
    await run(file);
  }

  function useSimulated() {
    if (!missing) return;
    onResult(missing.expected);
    onClose();
  }

  const chosen = photos.find((p) => p.name === choice);

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

      <label className="field-label" htmlFor="demo-photo">Use a demo photo</label>
      <select
        id="demo-photo"
        className="select"
        value={choice}
        onChange={(e) => {
          setChoice(e.target.value);
          setMissing(null);
          setProblem(null);
        }}
        disabled={busy}
      >
        <option value="">Choose a demo photo</option>
        {photos.map((p) => (
          <option key={p.name} value={p.name}>
            {p.label}
            {available[p.name] === false ? " (photo not added yet)" : ""}
            {showExpected ? ` (${expectedText(p.expected)})` : ""}
          </option>
        ))}
      </select>

      {chosen && available[chosen.name] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="demo-preview" src={demoUrl(chosen.name)} alt={`Preview of the demo photo: ${chosen.label}`} />
      )}

      <button type="button" className="btn btn-primary full" style={{ marginTop: 14 }} disabled={!choice || busy} onClick={useDemo}>
        Use this demo photo
      </button>

      <div role="status" aria-live="polite">
        {busy && <p className="muted">Checking the photo… this takes a few seconds.</p>}
        {problem && (
          <p className="form-error" role="alert">
            <Icon name="alert" size={16} /> {problem}
          </p>
        )}
        {missing && (
          <div className="missing-box" role="alert">
            <p>
              <Icon name="alert" size={16} /> Add this photo to <code>{demoPath(missing.name)}</code>
            </p>
            <button type="button" className="btn btn-outline full" onClick={useSimulated}>
              Use the simulated result instead (no AI)
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
