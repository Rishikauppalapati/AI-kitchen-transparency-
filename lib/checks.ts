// The question the AI answers for each photo check. Used only on the server.
// (The fridge reading is typed and judged by plain code, so it is not listed here.)

export const CHECKS: Record<string, string> = {
  caps_gloves: "Is a person in the photo wearing both a cap or hairnet and gloves?",
  floors_drains: "Are the floors and drains clean and dry, with no spills or clutter?",
  stock_labels: "Does every visible food container have a readable date label?",
  bins: "Are all visible bins closed with lids and not overflowing?",
  handwash: "Are soap (or a soap dispenser) and a wash basin both visible?",
  setup_seals: "Are tamper-evident seal stickers or a roll of them visible?",
  setup_bags_clean: "Do the delivery bags and boxes look clean?",
  setup_hot_cold: "Are hot and cold items in separate bags or compartments?",
  random_pack: "Is there a sealed bag with a sticker across the closure, and no visible spill?",
};
