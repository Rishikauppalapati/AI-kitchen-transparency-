import type { Restaurant } from "@/lib/types";

// All fictional. The UI always labels them "sample".
export const restaurants: Restaurant[] = [
  {
    id: "sample-cafe",
    name: "Sample Cafe",
    area: "Banjara Hills",
    cuisine: "Cafe and bakes",
    tone: "teal",
    raidState: "resolved",
    streakDays: 5,
    raid: {
      reportedOn: "2026-09-12",
      reported: [
        "Pest-control records reported missing",
        "Staff medical fitness certificates reported not available",
        "Stored food reported without date labels",
      ],
      action: "Notice issued; kitchen asked to correct and request a re-check",
      fixes: [
        {
          date: "2026-09-26",
          what: "Pest-control contract signed and logbook started",
          evidence: "Contract copy and first service report",
          evidenceLevel: 2,
        },
        {
          date: "2026-10-03",
          what: "Fitness certificates renewed for all kitchen staff",
          evidence: "Certificates uploaded by the manager",
          evidenceLevel: 2,
        },
        {
          date: "2026-10-04",
          what: "Date labels added to every stored container",
          evidence: "Photo check passed",
          evidenceLevel: 1,
        },
      ],
      recheck: { date: "2026-10-05", result: "Re-check passed" },
      sourceLabel: "Sample source link (not a real post)",
      sourceUrl: "https://example.com/sample-official-post",
    },
  },
  {
    id: "sample-biryani-house",
    name: "Sample Biryani House",
    area: "Gachibowli",
    cuisine: "Biryani and kebabs",
    tone: "amber",
    raidState: "unresolved",
    streakDays: 0,
    raid: {
      reportedOn: "2026-10-02",
      reported: [
        "Kitchen reported sealed after inspection",
        "Samples reported sent for lab testing, results awaited",
      ],
      action: "Kitchen reported sealed",
      fixes: [],
      sourceLabel: "Sample source link (not a real post)",
      sourceUrl: "https://example.com/sample-official-post",
    },
  },
  {
    id: "sample-bakery",
    name: "Sample Bakery",
    area: "Madhapur",
    cuisine: "Bread and pastries",
    tone: "slate",
    raidState: "none",
    streakDays: 12,
  },
];
