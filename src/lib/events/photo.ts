import { sites } from "@/content/knowledge/catalog";
import { getMedia } from "@/content/knowledge/media";
import type { MediaAsset } from "@/content/knowledge/schema";

const focus: Record<string, string> = {
  "folklore-as-living-heritage": "50% 45%",
  "nozh-i-vilushka-2026": "12% 60%",
  "detelinki-2026": "50% 35%",
  "cruise-cult-2026": "88% 55%",
  "we-will-rock-you-2026": "50% 18%",
  "nesto-sto-ke-ostane-2026": "50% 82%",
};

export function eventImage(event: { slug: string; imageId?: string; venues: string[] }) {
  if (event.imageId) {
    const direct = getMedia(event.imageId);
    if (direct) return direct;
  }
  const slug = event.venues[0];
  if (!slug) return undefined;
  const id = sites.find((site) => site.slug === slug)?.images[0];
  return id ? getMedia(id) : undefined;
}

export function eventImageFocus(slug: string) {
  return focus[slug] ?? "50% 50%";
}

export function eventHasPhoto(image: MediaAsset | undefined): image is MediaAsset {
  return Boolean(image);
}
