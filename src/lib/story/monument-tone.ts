import type { Motif } from "@/content/types";

export type MonumentTone = {
  palette: [string, string];
  paper: string;
  ink: string;
  accent: string;
  washA: string;
  washB: string;
};

const MOTIF_HUE: Partial<Record<Motif, number>> = {
  rider: 32,
  memorial: 348,
  museum: 214,
  gallery: 188,
  fort: 88,
  clock: 14,
  dome: 28,
  house: 164,
  bridge: 204,
  river: 192,
  arch: 38,
  hall: 262,
  stage: 292,
};

function hashSlug(slug: string) {
  let hash = 2166136261;
  for (let index = 0; index < slug.length; index += 1) {
    hash ^= slug.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = s * Math.min(l, 1 - l);
  const channel = (offset: number) => {
    const k = (offset + hue / 30) % 12;
    const value = l - chroma * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * value)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

export function monumentTone(slug: string, motif?: Motif): MonumentTone {
  const hash = hashSlug(slug);
  const family = MOTIF_HUE[motif ?? "hall"] ?? 210;
  const hue = (family + (hash % 37) * 9.73 + ((hash >> 5) % 13) * 3.4) % 360;
  const shift = (hue + 34 + (hash % 23)) % 360;
  const paperL = 72 + (hash % 12);
  const inkL = 10 + ((hash >> 3) % 8);
  const paperS = 58 + (hash % 22);
  const inkS = 42 + ((hash >> 6) % 20);
  const paper = hslToHex(hue, paperS, paperL);
  const ink = hslToHex(shift, inkS, inkL);
  const accent = hslToHex(hue, Math.min(88, paperS + 24), 46 + (hash % 10));
  return {
    palette: [paper, ink],
    paper,
    ink,
    accent,
    washA: `${accent}66`,
    washB: `${hslToHex(shift, 74, 48)}44`,
  };
}
