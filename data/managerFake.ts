// FAKE manager data for step 3. Step 4 replaces these with real, saved state.

export interface ScheduleItem {
  id: string;
  label: string;
  when: string;
  kind: "dining" | "delivery";
  done: boolean;
}

// Seven check-ins a day: dining open and close, two delivery setups, three random pack checks.
export const SCHEDULE: ScheduleItem[] = [
  { id: "dine-open", label: "Dining opening check", when: "9:00 AM", kind: "dining", done: true },
  { id: "setup-am", label: "Delivery shift setup", when: "11:30 AM", kind: "delivery", done: true },
  { id: "pack-1", label: "Random pack check", when: "12 to 2 PM", kind: "delivery", done: true },
  { id: "pack-2", label: "Random pack check", when: "12 to 2 PM", kind: "delivery", done: false },
  { id: "setup-pm", label: "Delivery shift setup", when: "6:30 PM", kind: "delivery", done: false },
  { id: "pack-3", label: "Random pack check", when: "7 to 9 PM", kind: "delivery", done: false },
  { id: "dine-close", label: "Dining closing check", when: "10:30 PM", kind: "dining", done: false },
];

// Restaurants with a check retaken 3 or more times (derived from real attempts in step 4).
export const FLAGGED: Record<string, string[]> = {
  "sample-cafe": [],
  "sample-biryani-house": ["Handwash station"],
  "sample-bakery": [],
};

export const DOCUMENTS_DUE = "Pest-control report due in 12 days";

export interface InboxComplaint {
  id: string;
  category: string;
  seal: "intact" | "broken" | "unsure";
  hoursAgo: number;
  resolved: boolean;
  fix?: string;
}

export const INBOX: Record<string, InboxComplaint[]> = {
  "sample-cafe": [
    { id: "i1", category: "Foreign object", seal: "intact", hoursAgo: 20, resolved: false },
    { id: "i2", category: "Seal broken", seal: "broken", hoursAgo: 9 * 24, resolved: true, fix: "New double-seal routine, photo recorded" },
  ],
  "sample-biryani-house": [{ id: "i3", category: "Spill", seal: "unsure", hoursAgo: 3 * 24, resolved: false }],
  "sample-bakery": [],
};
