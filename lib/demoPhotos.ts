// The demo photo library. Real image files go in public/demo/<name>.jpg (step 6).
// Until a file exists, picking it uses the expected result below, clearly labelled "simulated".

import type { AiResult } from "./types";

export interface DemoPhoto {
  name: string; // file name without extension
  checkId: string;
  label: string;
  expected: AiResult;
}

const pass = (note: string): AiResult => ({ relevant: true, status: "pass", note });
const fail = (note: string): AiResult => ({ relevant: true, status: "fail", note });

function pair(checkId: string, stem: string, label: string, tidy: string, untidy: string): DemoPhoto[] {
  return [
    { name: `${stem}_tidy`, checkId, label: `${label}: tidy`, expected: pass(tidy) },
    { name: `${stem}_untidy`, checkId, label: `${label}: untidy`, expected: fail(untidy) },
  ];
}

const CHECK_PHOTOS: DemoPhoto[] = [
  ...pair("caps_gloves", "caps_gloves", "Caps and gloves", "Cap and gloves clearly worn", "No gloves visible on hands"),
  ...pair("floors_drains", "floors", "Floors and drains", "Floor clean, dry, clear of clutter", "Spills and clutter on the floor"),
  ...pair("stock_labels", "labels", "Stock labels", "All containers show readable date labels", "Some containers have no date label"),
  ...pair("bins", "bins", "Bins", "Bin lids closed, nothing overflowing", "Bin lid open and overflowing"),
  ...pair("handwash", "handwash", "Handwash station", "Soap dispenser and basin clearly visible", "No soap visible at the basin"),
  ...pair("setup_seals", "seals", "Seals", "Seal stickers clearly visible", "No seal stickers or roll visible"),
  ...pair("setup_bags_clean", "bags", "Bags and boxes", "Bags and boxes look clean", "Stained bags visible in the stack"),
  ...pair("setup_hot_cold", "hotcold", "Hot and cold bags", "Hot and cold items in separate bags", "Hot and cold items share one bag"),
  ...pair("random_pack", "pack", "Packed order", "Bag sealed, sticker across the closure", "No sticker across the bag closure"),
];

// Bad inputs work for any check.
const BAD_INPUTS = (checkId: string): DemoPhoto[] => [
  {
    name: "not_a_kitchen",
    checkId,
    label: "Not a kitchen",
    expected: { relevant: false, status: "cannot_tell", note: "Photo doesn't show this" },
  },
  {
    name: "blurry_dark",
    checkId,
    label: "Blurry or dark",
    expected: { relevant: true, status: "cannot_tell", note: "Too dark or blurry to judge" },
  },
];

export function demoPhotosFor(checkId: string): DemoPhoto[] {
  return [...CHECK_PHOTOS.filter((p) => p.checkId === checkId), ...BAD_INPUTS(checkId)];
}

export function expectedText(r: AiResult): string {
  return r.relevant && r.status === "pass" ? "Expected: green" : "Expected: amber, retake";
}
