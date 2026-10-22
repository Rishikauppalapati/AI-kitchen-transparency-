// What each photo check looks for, in plain words. Shown in the photo sheet so the person taking the photo
// knows exactly what the AI will judge. (The AI itself is given the matching rules in lib/checks.ts, on the server.)

export interface CheckHelp {
  pass: string; // what makes the check pass
  fail: string; // what makes it fail
  tip: string; // how to take a photo the AI can judge
}

export const CHECK_HELP: Record<string, CheckHelp> = {
  caps_gloves: {
    pass: "Everyone you can see wears a cap, hairnet or chef's hat, and gloves.",
    fail: "Anyone in the photo has a bare head or bare hands.",
    tip: "Take it so heads and hands are in the picture.",
  },
  floors_drains: {
    pass: "The floor is clean, dry and clear.",
    fail: "There are spills, dirt, litter, water or objects on the floor.",
    tip: "Stand back so the floor and the drain show.",
  },
  stock_labels: {
    pass: "Every food container has a label with a date you can read.",
    fail: "A container has no label, or a label with no date.",
    tip: "Get close enough that the labels are readable.",
  },
  bins: {
    pass: "Every bin has its lid down and nothing is overflowing.",
    fail: "A bin is open, has no lid, or is overflowing.",
    tip: "Include all the bins in the photo.",
  },
  handwash: {
    pass: "Soap (or a soap dispenser) and a wash basin are both visible.",
    fail: "A basin is visible but there is no soap.",
    tip: "Show the basin and the soap together.",
  },
  setup_seals: {
    pass: "Seal stickers, or a roll of them, are visible.",
    fail: "The seal tray or roll is empty.",
    tip: "Show where the seals are kept.",
  },
  setup_bags_clean: {
    pass: "The delivery bags and boxes look clean.",
    fail: "Any bag or box has stains, grease or dirt.",
    tip: "Lay them out so their surfaces show.",
  },
  setup_hot_cold: {
    pass: "Hot and cold items are in separate bags or compartments.",
    fail: "Hot and cold items share one bag.",
    tip: "Show the packed items or the open bags.",
  },
  random_pack: {
    pass: "The bag is closed, a sticker runs across the closure, and nothing has spilled.",
    fail: "The bag is open, has no sticker across the closure, or has a spill.",
    tip: "Photograph the whole bag, including the top.",
  },
};
