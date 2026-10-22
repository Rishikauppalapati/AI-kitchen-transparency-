import { Icon } from "./Icons";

export interface NavItem<T extends string> {
  id: T;
  label: string;
  icon: string;
}

export default function BottomNav<T extends string>({
  items,
  active,
  onChange,
  label,
}: {
  items: NavItem<T>[];
  active: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <nav className="bottom-nav" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="nav-btn"
          aria-current={item.id === active ? "page" : undefined}
          onClick={() => onChange(item.id)}
        >
          <Icon name={item.icon} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}
