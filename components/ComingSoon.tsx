import { Icon } from "./Icons";

// Honest placeholder for screens built in later steps.
export default function ComingSoon({
  icon,
  title,
  step,
  items,
}: {
  icon: string;
  title: string;
  step: number;
  items: string[];
}) {
  return (
    <section className="card soon" aria-label={`${title}, coming in step ${step}`}>
      <span className="tile-icon">
        <Icon name={icon} />
      </span>
      <h2>{title}</h2>
      <span className="chip chip-grey">Built in step {step}</span>
      <ul>
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}
