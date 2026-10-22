// What the AI is asked for each photo check, and the exact rules it must use to decide. Used only on the server.
// Each entry names what counts as a PASS, what counts as a FAIL, and when the photo is not relevant at all,
// so a clear photo of the right thing passes, and the AI never has to guess what "tidy" means.
// (The fridge reading is typed and judged by plain code, so it is not listed here.)

export const CHECKS: Record<string, string> = {
  caps_gloves:
    "Staff hygiene: caps and gloves. Look at every person whose head and hands are visible. " +
    "PASS if every one of them wears a cap, hairnet or chef's hat AND gloves on the hands that are visible. " +
    "FAIL if any visible person has a bare head or bare hands. " +
    "Not relevant (relevant=false) if no person is visible.",

  floors_drains:
    "Floors and drains. " +
    "PASS if the floor is visible and clean, dry and clear: no spills, dirt, litter, water or objects lying on it. A drain with a clean cover is fine. " +
    "FAIL if there are spills, dirt, litter, standing water or objects on the floor. " +
    "Not relevant if no floor is visible.",

  stock_labels:
    "Stock labels and dates. " +
    "PASS if there are food containers and every visible container carries a label with a readable date. " +
    "FAIL if any visible container has no label, or a label with no date. " +
    "Not relevant if no food containers are visible.",

  bins:
    "Bins. " +
    "PASS if every visible waste bin is closed with its lid down and nothing is overflowing or lying around it. " +
    "FAIL if any visible bin has an open lid, no lid, or is overflowing. " +
    "Not relevant if no bin is visible.",

  handwash:
    "Handwash station. " +
    "PASS only if BOTH soap (or a soap dispenser) AND a wash basin are visible. " +
    "FAIL if a wash basin is visible but no soap or dispenser can be seen. " +
    "Not relevant if no wash basin and no soap are visible.",

  setup_seals:
    "Delivery seals. " +
    "PASS if tamper-evident seal stickers, or a roll or sheet of them, are visible and available. " +
    "FAIL if the place where seals are kept is visible but empty, or no seals can be seen on a packing table. " +
    "Not relevant if the photo shows no packing area at all.",

  setup_bags_clean:
    "Delivery bags and boxes. Inspect EVERY bag and EVERY box in the photo, one by one. " +
    "PASS only if all of them look clean, with no stains, splashes, grease marks, drips or dirt. " +
    "FAIL if ANY visible bag or box has a stain, splash, grease mark, drip or dirt, even if the others are clean. " +
    "Brown, yellow, orange or red patches, blotches, smears, drips or splatter on a bag or box look like spilled food, grease or sauce: " +
    "treat them as stains (a FAIL), never as part of the design. " +
    "Not relevant if no delivery bags or boxes are visible.",

  setup_hot_cold:
    "Hot and cold separation. " +
    "PASS if hot items and cold items are in separate bags or separate compartments. " +
    "FAIL if hot and cold items share the same bag or compartment. " +
    "Not relevant if the photo shows no bags or packed items.",

  random_pack:
    "Packed order. " +
    "PASS if the packed bag is closed, a seal sticker or tape strip runs across the closure, and there is no visible spill. " +
    "FAIL if the bag is open, has no sticker across the closure, or a spill is visible. " +
    "Not relevant if no packed bag is visible.",
};
