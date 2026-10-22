"use client";

import { useState } from "react";
import { Icon } from "../Icons";
import Sheet from "../Sheet";
import { demoPhotosFor, expectedText } from "@/lib/demoPhotos";
import type { AiResult } from "@/lib/types";

// Take photo, Upload, or Use a demo photo.
// Step 3: only demo photos produce a (simulated) result. Take and Upload call the real AI in step 5.
export default function PhotoSheet({
  checkId,
  title,
  showExpected,
  onResult,
  onClose,
}: {
  checkId: string;
  title: string;
  showExpected: boolean;
  onResult: (r: AiResult) => void;
  onClose: () => void;
}) {
  const photos = demoPhotosFor(checkId);
  const [choice, setChoice] = useState("");
  const [fileNote, setFileNote] = useState<string | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileNote("The real AI check connects in step 5. For now, use a demo photo below.");
    }
  };

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
        <label className="btn btn-primary file-btn">
          <Icon name="camera" size={20} />
          Take photo
          <input type="file" accept="image/*" capture="environment" onChange={onFile} />
        </label>
        <label className="btn btn-outline file-btn">
          <Icon name="upload" size={20} />
          Upload
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
        </label>
      </div>
      {fileNote && (
        <p className="muted" role="status">
          {fileNote}
        </p>
      )}

      <label className="field-label" htmlFor="demo-photo">Use a demo photo</label>
      <select id="demo-photo" className="select" value={choice} onChange={(e) => setChoice(e.target.value)}>
        <option value="">Choose a demo photo</option>
        {photos.map((p) => (
          <option key={p.name} value={p.name}>
            {p.label}
            {showExpected ? ` (${expectedText(p.expected)})` : ""}
          </option>
        ))}
      </select>
      <p className="chip chip-grey" style={{ marginTop: 10 }}>
        Simulated result: no AI call yet
      </p>

      <button type="button" className="btn btn-primary full" style={{ marginTop: 14 }} disabled={!choice} onClick={useDemo}>
        Use this demo photo
      </button>
    </Sheet>
  );
}
