import { Icon } from "./Icons";

export default function AppBar({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <header className="appbar">
      {onBack && (
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <Icon name="back" />
        </button>
      )}
      <h1>
        {title}
        {subtitle && <span className="sub">{subtitle}</span>}
      </h1>
    </header>
  );
}
