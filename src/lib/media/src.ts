import type { MediaAsset } from "@/content/knowledge/schema";

export function mediaSrc(asset: MediaAsset, width: number) {
  const base = asset.url.split("?")[0];
  return `${base}?width=${width}`;
}

export function mediaSrcSet(asset: MediaAsset) {
  return [640, 960, 1280, 1600].map((width) => `${mediaSrc(asset, width)} ${width}w`).join(", ");
}
