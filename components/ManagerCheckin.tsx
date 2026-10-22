"use client";

import { useState } from "react";
import { shrinkImage } from "@/lib/image";
import { ALLOWED_TYPES } from "@/lib/rules";
import type { CheckResponse, StoredCheck } from "@/lib/types";

const MAX_RAW_BYTES = 25 * 1024 * 1024;

type Message = { kind: "retake" | "error" | "success"; text: string } | null;

export default function ManagerCheckin({
  restaurantId,
  restaurantName,
  onVerified,
}: {
  restaurantId: string;
  restaurantName: string;
  onVerified: (check: StoredCheck) => void;
}) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function runCheck() {
    setMessage(null);
    if (!name.trim()) {
      setMessage({ kind: "retake", text: "Please type your name to sign off the check." });
      return;
    }
    if (!file) {
      setMessage({ kind: "retake", text: "Please choose a kitchen photo first." });
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage({ kind: "retake", text: "That file is not a photo we can read. Please upload a JPG, PNG or WebP picture." });
      return;
    }
    if (file.size > MAX_RAW_BYTES) {
      setMessage({ kind: "retake", text: "That photo is far too large. Please take a smaller one." });
      return;
    }

    setBusy(true);
    try {
      let small: File;
      try {
        small = await shrinkImage(file);
      } catch {
        setMessage({ kind: "retake", text: "We could not open that file as a picture. Please choose a different photo." });
        return;
      }

      const form = new FormData();
      form.set("restaurantId", restaurantId);
      form.set("signedBy", name.trim());
      form.set("photo", small);

      const res = await fetch("/api/check", { method: "POST", body: form });
      const data = (await res.json()) as CheckResponse;

      if (data.status === "verified") {
        onVerified(data.check);
        setMessage({ kind: "success", text: "Check saved. The diner view has been updated." });
        setFile(null);
      } else if (data.status === "retake") {
        setMessage({ kind: "retake", text: `Retake: ${data.reason}` });
      } else {
        setMessage({ kind: "error", text: data.message });
      }
    } catch {
      setMessage({ kind: "error", text: "We could not reach the server. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" aria-labelledby="manager-title">
      <p className="panel-tag">Manager view</p>
      <h2 id="manager-title">Daily kitchen check-in</h2>
      <p className="muted">
        {restaurantName}. Take one photo of your kitchen. We read caps and gloves, bin lids, and labels and dates.
      </p>

      <label className="field">
        <span>Your name (sign-off)</span>
        <input
          type="text"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Anita Rao"
        />
      </label>

      <label className="field">
        <span>Kitchen photo</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setMessage(null);
          }}
        />
      </label>

      <button className="primary" onClick={runCheck} disabled={busy}>
        {busy ? "Checking the photo…" : "Run check"}
      </button>

      <div role="status" aria-live="polite">
        {message && <p className={`msg msg-${message.kind}`}>{message.text}</p>}
      </div>
    </section>
  );
}
