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

// Demo images are plain JPEG files in public/demo/, named exactly like the list above.
export const demoUrl = (name: string) => `/demo/${name}.jpg`;
export const demoPath = (name: string) => `public/demo/${name}.jpg`;

// Is the file there? (Browser only.) A missing file must never crash the screen.
export async function demoPhotoExists(name: string): Promise<boolean> {
  try {
    const res = await fetch(demoUrl(name), { method: "HEAD" });
    return res.ok && (res.headers.get("content-type") ?? "").startsWith("image/");
  } catch {
    return false;
  }
}

// Fetch the image as a File, ready for the same check that Upload uses. Null if it is missing.
export async function loadDemoPhoto(name: string): Promise<File | null> {
  try {
    const res = await fetch(demoUrl(name));
    if (!res.ok || !(res.headers.get("content-type") ?? "").startsWith("image/")) return null;
    return new File([await res.blob()], `${name}.jpg`, { type: "image/jpeg" });
  } catch {
    return null;
  }
}

export function expectedText(r: AiResult): string {
  return r.relevant && r.status === "pass" ? "Expected: green" : "Expected: amber, retake";
}
