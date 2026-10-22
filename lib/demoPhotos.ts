// The demo photo library. Image files live in public/demo/<name>.jpg.
//
// Each photo has a SAVED RESULT: the answer the real AI gave this exact image when it was tested on 22 Oct 2026
// (the notes below are the AI's own words). Demo photos use the saved result by default, so a demo is instant and
// always the same: tidy photos turn green and untidy ones turn amber, whatever Google's AI service is doing that day.
// The tile says "demo photo" so nobody mistakes it for a live check. The "Live AI for demo photos" switch in the
// demo controls runs the real AI on them instead. Take photo always runs the live AI.

import type { AiResult } from "./types";

export interface DemoPhoto {
  name: string; // file name without extension
  checkId: string;
  label: string;
  expected: AiResult; // the saved result (also what the "Show expected AI result" option displays)
}

const pass = (note: string): AiResult => ({ relevant: true, status: "pass", note });
const fail = (note: string): AiResult => ({ relevant: true, status: "fail", note });
const notShown: AiResult = { relevant: false, status: "cannot_tell", note: "Photo doesn't show this" };

// [check id, file stem, label shown in the list, saved result for the tidy image, saved result for the untidy image]
const PAIRS: [string, string, string, AiResult, AiResult][] = [
  ["caps_gloves", "caps_gloves", "Caps and gloves", pass("Hat and gloves are worn"), fail("Bare heads and hands visible.")],
  ["floors_drains", "floors", "Floors and drains", pass("Floor and drain are clean, dry and clear"), fail("Water bottles and litter on the floor")],
  ["stock_labels", "labels", "Stock labels", pass("All containers have labels with readable dates."), fail("Food containers missing labels and dates")],
  ["bins", "bins", "Bins", pass("All three bins are closed with lids down."), fail("Waste bin is overflowing with rubbish.")],
  ["handwash", "handwash", "Handwash station", pass("Soap dispenser and wash basin are visible."), fail("Wash basin and running water visible, but no soap.")],
  ["setup_seals", "seals", "Seals", pass("Seal stickers and roll of seals are visible."), fail("No delivery seal stickers or rolls are visible.")],
  ["setup_bags_clean", "bags", "Bags and boxes", pass("Delivery bags and boxes are clean."), fail("Delivery bags and boxes show stains and food splashes.")],
  ["setup_hot_cold", "hotcold", "Hot and cold bags", pass("Hot and cold items are kept in separate bags."), fail("Hot and cold items share the same bag.")],
  ["random_pack", "pack", "Packed order", pass("Packed order is closed with a seal strip."), fail("Packed order bag has a visible spill.")],
];

const CHECK_PHOTOS: DemoPhoto[] = PAIRS.flatMap(([checkId, stem, label, tidy, untidy]) => [
  { name: `${stem}_tidy`, checkId, label: `${label}: tidy`, expected: tidy },
  { name: `${stem}_untidy`, checkId, label: `${label}: untidy`, expected: untidy },
]);

// Bad inputs work for any check. The real AI answered "doesn't show this" for both.
const BAD_INPUTS = (checkId: string): DemoPhoto[] => [
  { name: "not_a_kitchen", checkId, label: "Not a kitchen", expected: notShown },
  { name: "blurry_dark", checkId, label: "Blurry or dark", expected: notShown },
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
