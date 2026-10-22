// Names shown in the UI. (The AI questions for each check arrive in step 5, on the server.)

export const DINING_CHECKS = [
  { id: "caps_gloves", label: "Caps and gloves" },
  { id: "floors_drains", label: "Floors and drains" },
  { id: "stock_labels", label: "Stock labels and dates" },
  { id: "bins", label: "Bins lidded" },
  { id: "handwash", label: "Handwash station" },
  { id: "fridge", label: "Fridge temperature" },
] as const;

export const SETUP_CHECKS = [
  { id: "setup_seals", label: "Seals stocked", icon: "shield" },
  { id: "setup_bags_clean", label: "Bags and boxes clean", icon: "bag" },
  { id: "setup_hot_cold", label: "Hot and cold bags apart", icon: "thermo" },
] as const;

export const EVIDENCE_LABEL: Record<1 | 2 | 3, string> = {
  1: "photo",
  2: "sensor or document",
  3: "auditor",
};

export const COMPLAINT_CATEGORIES = ["Seal broken", "Spill", "Foreign object", "Stale or off", "Wrong order"] as const;
