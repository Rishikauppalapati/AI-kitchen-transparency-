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
  person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  floor: "M3 6h18v12H3zM3 12h18M9 6v12M15 6v12",
  tag: "M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01",
  trash: "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13",
  drop: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z",
  thermo: "M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z",
  camera: "M4 8h4l2-3h4l2 3h4v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  upload: "M12 16V4M7 9l5-5 5 5M5 20h14",
  shield: "M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z",
  bell: "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 21h4",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  doc: "M7 3h8l4 4v14H7zM15 3v4h4",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
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
