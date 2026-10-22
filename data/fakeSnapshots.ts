// FAKE published snapshots for step 2. In step 4 these come from real manager sign-offs.
// Times are "hours before the page loaded" so the freshness bands can be seen in all states.

export interface FakeComplaint {
  id: string;
  category: string;
  daysAgo: number;
  seal: "intact" | "broken" | "unsure";
  resolved: boolean;
  steps: { label: string; daysAgo: number }[]; // what has happened so far
  pending?: string; // the next step still waiting, if open
}

export interface FakeSnapshot {
  dining: { hoursAgo: number; fridgeC: number };
  delivery: {
    hoursAgo: number;
    packChecksPassed: number; // of 3 today
    hotColdApart: boolean;
    complaints: FakeComplaint[];
  };
}

export const fakeSnapshots: Record<string, FakeSnapshot> = {
  "sample-cafe": {
    dining: { hoursAgo: 2, fridgeC: 3.5 }, // green: Verified today
    delivery: {
      hoursAgo: 3, // green
      packChecksPassed: 2,
      hotColdApart: true,
      complaints: [
        {
          id: "c1",
          category: "Seal broken",
          daysAgo: 9,
          seal: "broken",
          resolved: true,
          steps: [
            { label: "Reported by a diner", daysAgo: 9 },
            { label: "Kitchen responded", daysAgo: 9 },
            { label: "Fix recorded: new double-seal routine (photo)", daysAgo: 8 },
          ],
        },
      ],
    },
  },
  "sample-biryani-house": {
    dining: { hoursAgo: 30, fridgeC: 4.5 }, // grey: Not verified for 1 day
    delivery: {
      hoursAgo: 8, // amber: Setup check overdue
      packChecksPassed: 1,
      hotColdApart: true,
      complaints: [
        {
          id: "c2",
          category: "Spill",
          daysAgo: 3,
          seal: "unsure",
          resolved: false,
          steps: [
            { label: "Reported by a diner", daysAgo: 3 },
            { label: "Kitchen responded", daysAgo: 2 },
          ],
          pending: "Fix not recorded yet",
        },
      ],
    },
  },
  "sample-bakery": {
    dining: { hoursAgo: 0.3, fridgeC: 2.8 }, // green: about 18 minutes ago
    delivery: {
      hoursAgo: 1,
      packChecksPassed: 3,
      hotColdApart: true,
      complaints: [],
    },
  },
};
