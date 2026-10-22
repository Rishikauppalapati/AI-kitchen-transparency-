import { Icon } from "./Icons";
import type { RaidState } from "@/lib/types";

// Colour is never the only signal: every state has an icon and words.
const CONTENT: Record<RaidState, { cls: string; icon: string; text: string }> = {
  resolved: { cls: "chip-green", icon: "check", text: "Raid reported, resolved" },
  unresolved: { cls: "chip-amber", icon: "alert", text: "Raid reported, no follow-up found" },
  none: { cls: "chip-grey", icon: "dash", text: "No raids reported" },
};

export default function RaidChip({ state }: { state: RaidState }) {
  const c = CONTENT[state];
  return (
    <span className={`chip ${c.cls}`}>
      <Icon name={c.icon} size={14} />
      {c.text}
    </span>
  );
}
