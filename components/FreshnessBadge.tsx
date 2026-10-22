import { Icon } from "./Icons";
import type { Freshness } from "@/lib/time";

// Colour plus an icon plus words, never colour alone.
const ICON = { green: "check", amber: "alert", grey: "dash" } as const;

export default function FreshnessBadge({ freshness }: { freshness: Freshness }) {
  return (
    <span className={`fresh fresh-${freshness.tone}`}>
      <Icon name={ICON[freshness.tone]} size={18} />
      {freshness.label}
    </span>
  );
}
