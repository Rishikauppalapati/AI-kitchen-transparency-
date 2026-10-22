// Small inline stroke icons. Decorative: the button or text next to them carries the meaning.

const PATHS: Record<string, string> = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  dining: "M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10M17 3v8",
  delivery: "M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2",
  inbox: "M4 5h16v11H8l-4 4V5zM8 9h8M8 12h5",
  news: "M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4zM9 8h6M9 12h6M9 16h4",
  flag: "M6 21V4M6 5h11l-2 4 2 4H6",
  back: "M15 5l-7 7 7 7",
  sliders: "M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4",
  close: "M6 6l12 12M18 6L6 18",
  check: "M5 12.5l4.5 4.5L19 7.5",
  alert: "M12 4l9 16H3L12 4zM12 10v4M12 17.5v.5",
  dash: "M6 12h12",
  plus: "M12 5v14M5 12h14",
  bag: "M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2",
  chevron: "M9 5l7 7-7 7",
};

export function Icon({ name, size = 22 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name] ?? PATHS.dash} />
    </svg>
  );
}
