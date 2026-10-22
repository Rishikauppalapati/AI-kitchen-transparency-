import { Icon } from "../Icons";
import type { TileState } from "@/lib/types";

// States: to do (white), checked (green), retake (amber with a short note).
// Each state has an icon and words, so colour is never the only signal.
export default function CheckTile({
  label,
  icon,
  tile,
  onOpen,
}: {
  label: string;
  icon: string;
  tile: TileState;
  onOpen: () => void;
}) {
  const status =
    tile.state === "checked" ? "Checked" : tile.state === "retake" ? "Needs a retake" : "To do";

  return (
    <button
      type="button"
      className={`ctile ctile-${tile.state}`}
      onClick={onOpen}
      aria-label={`${label}. ${status}.${tile.note ? ` ${tile.note}.` : ""}`}
    >
      <span className="ctile-icon" aria-hidden="true">
        <Icon name={tile.state === "checked" ? "check" : tile.state === "retake" ? "alert" : icon} />
      </span>
      <span className="ctile-label">{label}</span>
      <span className="ctile-status" aria-hidden="true">
        {status}
        {tile.note && <span className="ctile-note">{tile.note}</span>}
        {tile.state === "retake" && <span className="ctile-pill">Retake</span>}
      </span>
    </button>
  );
}
