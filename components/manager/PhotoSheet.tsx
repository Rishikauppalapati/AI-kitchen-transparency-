"use client";

import { useEffect, useState } from "react";
import { Icon } from "../Icons";
import Sheet from "../Sheet";
import { CHECK_HELP } from "@/lib/checkHelp";
import { checkPhoto } from "@/lib/checkPhoto";
import { demoPath, demoPhotoExists, demoPhotosFor, demoUrl, expectedText, loadDemoPhoto, type DemoPhoto } from "@/lib/demoPhotos";
import type { AiResult } from "@/lib/types";

// Take photo always runs the live AI (POST /api/check). File upload is switched off for now.
// A demo photo applies the result the real AI gave that exact image when it was tested, instantly, so a demo is
// always the same (tidy goes green, untidy goes amber). With "Live AI for demo photos" on, it runs the live AI
// instead, and falls back to the saved result if the AI service is busy or unavailable.
export default function PhotoSheet({
  checkId,
  title,
  showExpected,
  liveDemo,
  onResult,
  onError,
  onClose,
}: {
  checkId: string;
  title: string;
  showExpected: boolean;
  liveDemo: boolean;
  onResult: (r: AiResult, via: "ai" | "demo") => void;
  onError: (retryAfterSeconds?: number) => void; // the AI or network failed: the tile turns amber
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

  async function run(file: File, demo?: DemoPhoto) {
    setProblem(null);
    setMissing(null);
    setBusy(true);
    const outcome = await checkPhoto(checkId, file);
    setBusy(false);

    if (outcome.kind === "result") {
      onResult(outcome.result, "ai");
      onClose();
    } else if (outcome.kind === "error") {
      if (demo) {
        onResult(demo.expected, "demo"); // the live AI is unavailable: use this demo photo's saved result
      } else {
        onError(outcome.retryAfterSeconds);
      }
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
    if (!liveDemo) {
      onResult(photo.expected, "demo"); // the saved result: instant and always the same
      onClose();
      return;
    }
    setBusy(true);
    const file = await loadDemoPhoto(photo.name);
    setBusy(false);
    if (!file) return setMissing(photo); // not added yet: say so, don't crash
    await run(file, photo);
  }

  function useSaved() {
    if (!missing) return;
    onResult(missing.expected, "demo");
    onClose();
  }

  const chosen = photos.find((p) => p.name === choice);

  const help = CHECK_HELP[checkId];

  return (
    <Sheet title={title} onClose={onClose}>
      {help && (
        <section className="check-help" aria-label="What the AI checks">
          <h3>What the AI checks</h3>
          <p>
            <Icon name="check" size={16} /> <strong>Passes:</strong> {help.pass}
          </p>
          <p>
            <Icon name="alert" size={16} /> <strong>Fails:</strong> {help.fail}
          </p>
          <p className="muted">{help.tip} Use good light and hold still.</p>
          <p className="muted">
            If the AI says &quot;Photo doesn&apos;t show this&quot;, the item wasn&apos;t in the picture. That is not a fail: just retake it showing the item.
            If it says it was busy, that is not a fail either: tap the tile and send the photo again.
          </p>
        </section>
      )}

      <div className="photo-options">
        <label className="btn btn-primary file-btn" aria-disabled={busy}>
          <Icon name="camera" size={20} />
          Take photo
          <input type="file" accept="image/*" capture="environment" onChange={onFile} disabled={busy} />
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
      <p className="muted" style={{ margin: "8px 0 0" }}>
        {liveDemo
          ? "Live AI for demo photos is on: the real AI checks the picture (if it is unavailable, the saved result is used)."
          : "A demo photo uses the result the real AI gave this exact picture when it was tested, so it is instant and always the same. Take photo always runs the live AI."}
      </p>

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
            <button type="button" className="btn btn-outline full" onClick={useSaved}>
              Use the saved result instead (no live AI)
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
