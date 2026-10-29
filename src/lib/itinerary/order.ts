import { haversineMeters } from "@/content/knowledge/boundary";
import { coordinatesOf } from "@/lib/graph/query";
import type { Coordinates } from "@/content/types";

export function nearestNeighborOrder(start: string, candidates: string[]): string[] {
  const remaining = new Set(candidates.filter((slug) => slug !== start));
  const ordered = [start];
  while (remaining.size) {
    const last = ordered[ordered.length - 1];
    const origin = coordinatesOf(last);
    let best: string | null = null;
    let bestMeters = Infinity;
    for (const slug of remaining) {
      const point = coordinatesOf(slug);
      if (!origin || !point) continue;
      const meters = haversineMeters(origin, point);
      if (meters < bestMeters) {
        best = slug;
        bestMeters = meters;
      }
    }
    if (!best) break;
    remaining.delete(best);
    ordered.push(best);
  }
  return ordered;
}

export function nearestSlug(origin: Coordinates, slugs: string[], maxMeters = 800) {
  let best: string | null = null;
  let bestMeters = Infinity;
  for (const slug of slugs) {
    const point = coordinatesOf(slug);
    if (!point) continue;
    const meters = haversineMeters(origin, point);
    if (meters < bestMeters) {
      best = slug;
      bestMeters = meters;
    }
  }
  if (!best || bestMeters > maxMeters) return null;
  return best;
}
