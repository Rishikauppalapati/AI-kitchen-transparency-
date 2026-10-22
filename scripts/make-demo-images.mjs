// Draws the demo images that have no suitable free photo, as SVG artwork, into demo-sources/.
// Run:  node scripts/make-demo-images.mjs   then   powershell -File scripts/render-demo-images.ps1
// Each scene shows exactly what its check looks for (see lib/checks.ts), either clearly met (tidy) or clearly not (untidy).

import { mkdirSync, writeFileSync } from "node:fs";

const W = 1024;
const H = 768;
const out = new URL("../demo-sources/", import.meta.url);
mkdirSync(out, { recursive: true });

const defs = `<defs>
  <pattern id="tiles" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="#e6eef1"/><path d="M0 0H64M0 0V64" stroke="#cbd8dd" stroke-width="2"/></pattern>
  <pattern id="floor" width="96" height="96" patternUnits="userSpaceOnUse"><rect width="96" height="96" fill="#e4e2dc"/><path d="M0 0H96M0 0V96" stroke="#c7c4bb" stroke-width="3"/></pattern>
  <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef2f4"/><stop offset="1" stop-color="#a9b4bb"/></linearGradient>
  <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b88a"/><stop offset="1" stop-color="#b98f5c"/></linearGradient>
  <filter id="stain" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30"/><feGaussianBlur stdDeviation="1.6"/></filter>
  <filter id="splat" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9"/></filter>
</defs>`;

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial, Helvetica, sans-serif">${defs}${body}</svg>`;

const wall = `<rect width="${W}" height="520" fill="url(#tiles)"/>`;
const floorBase = `<rect y="520" width="${W}" height="${H - 520}" fill="url(#floor)"/><rect y="516" width="${W}" height="8" fill="#b8c4c9"/>`;
const text = (x, y, s, size = 28, fill = "#222", weight = 700, anchor = "middle") =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;

// ---------- 1. A cook wearing a cap and gloves ----------
function capsGlovesTidy() {
  const skin = "#f0c6a0";
  const glove = "#2f7fd6";
  const hand = (cx) =>
    `<circle cx="${cx}" cy="548" r="38" fill="${glove}" stroke="#1d5aa6" stroke-width="4"/>` +
    [-18, -6, 6, 18].map((d) => `<path d="M${cx + d} 524v-24" stroke="${glove}" stroke-width="13" stroke-linecap="round"/>`).join("");
  return svg(`${wall}
  <rect x="0" y="120" width="${W}" height="14" fill="url(#steel)"/>
  ${[120, 270, 760, 900].map((x) => `<path d="M${x} 134v34" stroke="#889" stroke-width="5"/><ellipse cx="${x}" cy="196" rx="52" ry="36" fill="#9aa7ae" stroke="#6b7a82" stroke-width="4"/>`).join("")}
  <rect x="372" y="330" width="280" height="260" rx="64" fill="#fff" stroke="#c9d3d8" stroke-width="5"/>
  <circle cx="512" cy="400" r="7" fill="#c9d3d8"/><circle cx="512" cy="440" r="7" fill="#c9d3d8"/><circle cx="512" cy="480" r="7" fill="#c9d3d8"/>
  <circle cx="512" cy="262" r="66" fill="${skin}"/>
  <circle cx="488" cy="256" r="7" fill="#222"/><circle cx="536" cy="256" r="7" fill="#222"/>
  <path d="M488 288q24 22 48 0" fill="none" stroke="#222" stroke-width="5" stroke-linecap="round"/>
  <path d="M440 218q-34-58 22-84q24-50 50-12q26-38 50 12q58 24 22 84z" fill="#fff" stroke="#c9d3d8" stroke-width="5"/>
  <rect x="446" y="200" width="132" height="30" rx="8" fill="#fff" stroke="#c9d3d8" stroke-width="5"/>
  <rect x="0" y="560" width="${W}" height="${H - 560}" fill="url(#steel)"/><rect y="556" width="${W}" height="10" fill="#cfd8dd"/>
  <rect x="430" y="574" width="164" height="22" rx="6" fill="#d8b98a"/>
  <circle cx="478" cy="570" r="14" fill="#ee7d22"/><circle cx="520" cy="570" r="14" fill="#ee7d22"/><circle cx="560" cy="570" r="14" fill="#6aa84f"/>
  ${hand(410)}${hand(614)}`);
}

// ---------- 2. A clean, dry, clear floor with a drain ----------
function floorsTidy() {
  return svg(`${wall}
  <rect x="0" y="330" width="${W}" height="16" fill="url(#steel)"/>
  ${[90, 330, 590, 840].map((x) => `<rect x="${x}" y="346" width="100" height="174" fill="url(#steel)" stroke="#8a969c" stroke-width="3"/>`).join("")}
  ${floorBase}
  <circle cx="512" cy="660" r="62" fill="#c2c7ca" stroke="#8a9398" stroke-width="5"/>
  ${[-36, -18, 0, 18, 36].map((d) => `<path d="M${512 + d} 618v84" stroke="#78838a" stroke-width="7" stroke-linecap="round"/>`).join("")}
  ${[[200, 600], [820, 640], [330, 700], [700, 590]].map(([x, y]) => `<path d="M${x} ${y}l8 -22l8 22l-8 -6z" fill="#fff" opacity="0.8"/>`).join("")}`);
}

// ---------- 3. Food containers, each with a readable dated label ----------
function labelsTidy() {
  const items = [["RICE", "22 OCT", "#f3e6b8"], ["DAL", "22 OCT", "#e0b44e"], ["CURRY", "21 OCT", "#d9703a"], ["VEG", "22 OCT", "#7fbf5a"], ["RAITA", "22 OCT", "#f6f1e6"], ["SAUCE", "20 OCT", "#c63c2f"]];
  const box = ([name, date, color], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 100 + col * 290;
    const y = 190 + row * 270;
    return `<rect x="${x}" y="${y}" width="240" height="170" rx="18" fill="#fdfdfd" stroke="#9fb0b8" stroke-width="5"/>
      <rect x="${x + 14}" y="${y + 70}" width="212" height="86" rx="12" fill="${color}"/>
      <rect x="${x - 4}" y="${y - 14}" width="248" height="26" rx="10" fill="#7a8a92"/>
      <rect x="${x + 40}" y="${y + 34}" width="160" height="78" rx="8" fill="#fff" stroke="#333" stroke-width="3"/>
      ${text(x + 120, y + 70, name, 30, "#111", 800)}${text(x + 120, y + 102, date, 28, "#111", 700)}`;
  };
  return svg(`${wall}
  <rect x="60" y="360" width="${W - 120}" height="18" rx="6" fill="url(#wood)"/>
  <rect x="60" y="630" width="${W - 120}" height="18" rx="6" fill="url(#wood)"/>
  ${items.map(box).join("")}`);
}

// ---------- 4. Waste bins, all closed ----------
function binsTidy() {
  const bin = (x, color, label) => `
    <rect x="${x}" y="360" width="190" height="260" rx="14" fill="${color}" stroke="#2c3a40" stroke-width="5"/>
    <rect x="${x - 10}" y="326" width="210" height="44" rx="14" fill="${color}" stroke="#2c3a40" stroke-width="5"/>
    <rect x="${x + 70}" y="336" width="50" height="12" rx="6" fill="#2c3a40"/>
    <circle cx="${x + 30}" cy="636" r="18" fill="#333"/><circle cx="${x + 160}" cy="636" r="18" fill="#333"/>
    ${text(x + 95, 500, label, 34, "#fff", 800)}`;
  return svg(`${wall}${floorBase}
  ${bin(110, "#3b8f5a", "WET")}${bin(420, "#3b6fb0", "DRY")}${bin(730, "#6b7378", "OTHER")}`);
}

// ---------- 5. Seal stickers present or missing ----------
function table() {
  return `${wall}<rect x="0" y="470" width="${W}" height="${H - 470}" fill="url(#steel)"/><rect y="466" width="${W}" height="10" fill="#cfd8dd"/>
  <rect x="60" y="150" width="190" height="120" rx="10" fill="#fff" stroke="#8a969c" stroke-width="4"/>
  <rect x="780" y="150" width="190" height="120" rx="10" fill="#fff" stroke="#8a969c" stroke-width="4"/>`;
}
function sealsTidy() {
  const sticker = (x, y, r = 0) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 70}" y="${y - 22}" width="140" height="44" rx="8" fill="#d6291f" stroke="#8f1710" stroke-width="3"/>${text(x, y + 9, "SEALED", 26, "#fff", 800)}</g>`;
  return svg(`${table()}
  <rect x="200" y="520" width="620" height="170" rx="20" fill="#fff" stroke="#6d7b82" stroke-width="6"/>
  ${text(510, 560, "SEAL STICKERS", 34, "#222", 800)}
  ${sticker(340, 610, -4)}${sticker(510, 618, 3)}${sticker(680, 610, -2)}${sticker(430, 660, 2)}${sticker(600, 662, -3)}
  <circle cx="880" cy="580" r="90" fill="#d6291f" stroke="#8f1710" stroke-width="6"/><circle cx="880" cy="580" r="36" fill="#e7e9ea" stroke="#8f1710" stroke-width="5"/>
  ${text(880, 700, "ROLL OF SEALS", 24, "#222", 800)}
  <rect x="110" y="330" width="90" height="120" rx="10" fill="#fff" stroke="#8a969c" stroke-width="4"/>`);
}
function sealsUntidy() {
  return svg(`${table()}
  <rect x="200" y="520" width="620" height="170" rx="20" fill="#f4f4f2" stroke="#6d7b82" stroke-width="6"/>
  <rect x="226" y="580" width="568" height="90" rx="10" fill="#e5e5e2"/>
  <rect x="90" y="410" width="90" height="60" rx="6" fill="#c29a67" stroke="#6b5230" stroke-width="4"/><rect x="190" y="425" width="80" height="45" rx="6" fill="#c29a67" stroke="#6b5230" stroke-width="4"/>`);
}

// ---------- 6. Delivery bags and boxes, clean or stained ----------
function bagsScene(stained) {
  const bag = (x, color, w = 170, h = 250) => `
    <path d="M${x + 40} 380q0 -70 45 -70t45 70" fill="none" stroke="#555" stroke-width="10"/>
    <rect x="${x}" y="380" width="${w}" height="${h}" rx="14" fill="${color}" stroke="#41505a" stroke-width="5"/>`;
  // Dirt that reads as dirt: soft, uneven grease halos and sauce blotches (wobbly edges), drips and splatter.
  const stains = (x) =>
    `<g filter="url(#stain)" opacity="0.88">
       <ellipse cx="${x + 70}" cy="470" rx="88" ry="66" fill="#d9a441" opacity="0.55"/>
       <ellipse cx="${x + 62}" cy="465" rx="52" ry="38" fill="#8a4b14"/>
       <ellipse cx="${x + 112}" cy="560" rx="46" ry="52" fill="#d9a441" opacity="0.5"/>
       <ellipse cx="${x + 105}" cy="556" rx="26" ry="30" fill="#a9561c"/>
       <path d="M${x + 44} 500q4 40 -2 80M${x + 70} 508q3 30 0 48M${x + 118} 585q3 22 0 40" stroke="#8a4b14" stroke-width="10" stroke-linecap="round" fill="none"/>
     </g>
     <g filter="url(#splat)" fill="#6b3410">
       <circle cx="${x + 146}" cy="425" r="6"/><circle cx="${x + 24}" cy="560" r="8"/><circle cx="${x + 96}" cy="622" r="5"/><circle cx="${x + 154}" cy="500" r="4"/><circle cx="${x + 30}" cy="420" r="5"/>
     </g>`;
  const box = (x, y, stain) => `<rect x="${x}" y="${y}" width="150" height="110" rx="10" fill="#f4f1ea" stroke="#8a7f6a" stroke-width="5"/>${stain ? `<g filter="url(#stain)" opacity="0.9"><ellipse cx="${x + 70}" cy="${y + 56}" rx="64" ry="38" fill="#c8812a" opacity="0.5"/><ellipse cx="${x + 66}" cy="${y + 54}" rx="42" ry="24" fill="#9b2f12"/><path d="M${x + 46} ${y + 78}q3 22 -1 40M${x + 98} ${y + 82}q3 18 0 32" stroke="#9b2f12" stroke-width="9" stroke-linecap="round" fill="none"/></g><g filter="url(#splat)" fill="#7a2410"><circle cx="${x + 128}" cy="${y + 22}" r="6"/><circle cx="${x + 20}" cy="${y + 90}" r="5"/></g>` : ""}`;
  return svg(`${wall}${floorBase}
  <rect x="60" y="634" width="${W - 120}" height="22" rx="8" fill="url(#steel)"/>
  ${bag(110, stained ? "#e9dfc9" : "#ffffff")}${stained ? stains(110) : ""}
  ${bag(340, stained ? "#d9e6e2" : "#2aa198")}${stained ? stains(340) : ""}
  ${bag(570, stained ? "#e9dfc9" : "#ffffff")}${stained ? stains(570) : ""}
  ${box(790, 520, stained)}${box(790, 400, stained)}`);
}

// ---------- 7. Hot and cold bags, apart or mixed ----------
function hotColdTidy() {
  return svg(`${wall}${floorBase}
  <path d="M170 330q0 -80 70 -80t70 80" fill="none" stroke="#444" stroke-width="12"/>
  <rect x="110" y="330" width="260" height="280" rx="24" fill="#c9372c" stroke="#7d1d16" stroke-width="6"/>
  ${text(240, 450, "HOT", 70, "#fff", 900)}${text(240, 520, "biryani, curry", 26, "#fff", 700)}
  ${[0, 1, 2].map((i) => `<path d="M${200 + i * 40} 300q-14 -26 0 -52t0 -50" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.9"/>`).join("")}
  <path d="M720 330q0 -80 70 -80t70 80" fill="none" stroke="#444" stroke-width="12"/>
  <rect x="660" y="330" width="260" height="280" rx="24" fill="#2b72c9" stroke="#18407a" stroke-width="6"/>
  ${text(790, 450, "COLD", 70, "#fff", 900)}${text(790, 520, "ice cream, drinks", 26, "#fff", 700)}
  <path d="M790 270v-50M765 245l50 0M772 224l36 42M808 224l-36 42" stroke="#cfe8ff" stroke-width="6" stroke-linecap="round"/>
  <path d="M420 480h220" stroke="#7a8a92" stroke-width="6" stroke-dasharray="14 12"/>${text(530, 460, "kept apart", 26, "#456", 700)}`);
}
function hotColdUntidy() {
  return svg(`${wall}${floorBase}
  <path d="M340 300q0 -90 172 -90t172 90" fill="none" stroke="#444" stroke-width="12"/>
  <rect x="270" y="300" width="484" height="320" rx="26" fill="#8a8f93" stroke="#444c52" stroke-width="6"/>
  <rect x="300" y="330" width="424" height="260" rx="14" fill="#d8dcde"/>
  <rect x="320" y="400" width="170" height="150" rx="12" fill="#d6842a" stroke="#8a4e10" stroke-width="5"/>
  ${text(405, 465, "HOT", 44, "#fff", 900)}${text(405, 505, "biryani", 24, "#fff", 700)}
  ${[0, 1, 2].map((i) => `<path d="M${360 + i * 36} 392q-12 -24 0 -46t0 -40" fill="none" stroke="#e8553a" stroke-width="7" stroke-linecap="round"/>`).join("")}
  <path d="M530 540l40 -120h70l40 120z" fill="#e9f3fb" stroke="#4a86bd" stroke-width="5"/>
  <circle cx="605" cy="410" r="40" fill="#f7c6d6" stroke="#c4577c" stroke-width="5"/>
  ${text(605, 505, "COLD", 36, "#2b72c9", 900)}${text(605, 535, "ice cream", 22, "#2b72c9", 700)}
  <rect x="660" y="430" width="50" height="120" rx="10" fill="#6fb6e8" stroke="#2b72c9" stroke-width="5"/>
  <path d="M530 560q16 22 32 0" fill="#f7c6d6" stroke="#c4577c" stroke-width="4"/>`);
}

// ---------- 8. A packed order: sealed, or open and spilled ----------
function packTidy() {
  return svg(`${table()}
  <path d="M330 330l60 -60h244l60 60z" fill="#a8845a" stroke="#6b5230" stroke-width="5"/>
  <rect x="330" y="330" width="364" height="270" rx="10" fill="#c29a67" stroke="#6b5230" stroke-width="6"/>
  <path d="M330 330h364v36h-364z" fill="#b08657"/>
  <rect x="318" y="322" width="388" height="40" rx="8" fill="#d6291f" stroke="#8f1710" stroke-width="4"/>
  ${text(512, 352, "SEALED  SEALED  SEALED", 26, "#fff", 800)}
  ${text(512, 480, "ORDER 4821", 38, "#fff", 800)}
  <rect x="420" y="520" width="184" height="50" rx="8" fill="#fff" opacity="0.9"/>${text(512, 555, "Clear Kitchen", 26, "#0f766e", 800)}`);
}
function packUntidy() {
  return svg(`${table()}
  <ellipse cx="520" cy="640" rx="260" ry="60" fill="#b34a1a" opacity="0.8"/><ellipse cx="560" cy="650" rx="150" ry="34" fill="#8f3a12" opacity="0.8"/>
  <path d="M450 600q-8 40 10 70M610 610q10 40 -4 60" stroke="#b34a1a" stroke-width="14" stroke-linecap="round" fill="none"/>
  <rect x="330" y="360" width="364" height="260" rx="10" fill="#c29a67" stroke="#6b5230" stroke-width="6"/>
  <path d="M330 360l-40 -70l110 30zM694 360l40 -70l-110 30z" fill="#a8845a" stroke="#6b5230" stroke-width="5"/>
  <rect x="380" y="290" width="264" height="86" rx="10" fill="#f4f1ea" stroke="#8a7f6a" stroke-width="5"/>
  <ellipse cx="512" cy="330" rx="110" ry="26" fill="#d6842a"/>
  <ellipse cx="560" cy="560" rx="60" ry="40" fill="#b34a1a" opacity="0.85"/>`);
}

const scenes = {
  caps_gloves_tidy: capsGlovesTidy(),
  floors_tidy: floorsTidy(),
  labels_tidy: labelsTidy(),
  bins_tidy: binsTidy(),
  seals_tidy: sealsTidy(),
  seals_untidy: sealsUntidy(),
  bags_tidy: bagsScene(false),
  bags_untidy: bagsScene(true),
  hotcold_tidy: hotColdTidy(),
  hotcold_untidy: hotColdUntidy(),
  pack_tidy: packTidy(),
  pack_untidy: packUntidy(),
};

for (const [name, body] of Object.entries(scenes)) {
  writeFileSync(new URL(`${name}.svg`, out), body);
}
console.log(`wrote ${Object.keys(scenes).length} SVG files to demo-sources/`);
