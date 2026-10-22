export default function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="ext-link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
