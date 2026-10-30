import type { MediaAsset } from "@/content/knowledge/schema";

export function mediaSrc(asset: MediaAsset, width: number) {
  if (asset.url.startsWith("/")) return asset.url;
  const base = asset.url.split("?")[0];
  return `${base}?width=${width}`;
}

export function mediaSrcSet(asset: MediaAsset) {
  if (asset.url.startsWith("/")) return undefined;
  return [640, 960, 1280, 1600].map((width) => `${mediaSrc(asset, width)} ${width}w`).join(", ");
}
