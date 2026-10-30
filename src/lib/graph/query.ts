import { L } from "@/content/copy";
import { haversineMeters } from "@/content/knowledge/boundary";
import { getSite, sites } from "@/content/knowledge/catalog";
import { relations } from "@/content/knowledge/relations";
import type { RelationshipKind, RelationshipRecord } from "@/content/knowledge/schema";
import type { Coordinates, Copy } from "@/content/types";
import type { GraphLeg } from "@/lib/graph/types";

export const PROXIMITY_METERS = 250;

const proximityCopy = L(
  "This stop is included because it is geographically close to the previous destination. Proximity is not historical proof.",
  "Оваа постојка е вклучена затоа што е географски блиску до претходната. Близината не е историски доказ.",
  "Ovo stajalište je uključeno jer je geografski blizu prethodnog. Blizina nije istorijski dokaz.",
  "Bu durak, önceki varış noktasına coğrafi olarak yakın olduğu için eklenmiştir. Yakınlık tarihî kanıt değildir.",
  "Цю зупинку включено, бо вона географічно близька до попередньої. Близькість не є історичним доказом.",
 "Kjo ndalesë përfshihet sepse është gjeografikisht afër destinacionit të mëparshëm. Afërsia nuk është provë historike.");

export function otherEnd(edge: RelationshipRecord, slug: string) {
  if (edge.from === slug) return edge.to;
  if (edge.to === slug) return edge.from;
  return null;
}

export function edgesFor(slug: string): RelationshipRecord[] {
  return relations.filter((edge) => edge.from === slug || edge.to === slug);
}

export function historicalEdgesFor(slug: string): RelationshipRecord[] {
  return edgesFor(slug).filter((edge) => edge.historical && edge.from !== edge.to);
}

export function sitesByTheme(themeId: string): string[] {
  const slugs = new Set<string>();
  for (const edge of relations) {
    if (!edge.themeIds.includes(themeId)) continue;
    slugs.add(edge.from);
    slugs.add(edge.to);
  }
  return [...slugs];
}

export function themeIds(): string[] {
  const ids = new Set<string>();
  for (const edge of relations) {
    for (const theme of edge.themeIds) ids.add(theme);
  }
  return [...ids].sort();
}

export function preferHistorical(a: RelationshipRecord, b: RelationshipRecord) {
  if (a.historical !== b.historical) return a.historical ? -1 : 1;
  const rank: Record<RelationshipKind, number> = {
    "same-creator": 0,
    "same-person": 1,
    "same-event": 2,
    "architectural-movement": 3,
    "documented-ensemble": 4,
    "institution-link": 5,
    "same-period": 6,
    "documented-route": 7,
    "geographic-proximity": 8,
  };
  return rank[a.kind] - rank[b.kind];
}

export function bestEdge(from: string, to: string): RelationshipRecord | undefined {
  const matches = relations.filter(
    (edge) =>
      (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from),
  );
  return [...matches].sort(preferHistorical)[0];
}

export function coordinatesOf(slug: string): Coordinates | undefined {
  return getSite(slug)?.coordinates;
}

export function proximityEdge(from: string, to: string): GraphLeg | null {
  const a = coordinatesOf(from);
  const b = coordinatesOf(to);
  if (!a || !b) return null;
  const meters = haversineMeters(a, b);
  if (meters > PROXIMITY_METERS) return null;
  return {
    id: `rel-geo-${from}-${to}`,
    kind: "geographic-proximity",
    from,
    to,
    historical: false,
    practical: true,
    explanation: proximityCopy,
    sourceIds: [],
    verificationStatus: "confirmed",
    themeIds: [],
  };
}

export function explainLeg(from: string, to: string): GraphLeg {
  const sourced = bestEdge(from, to);
  if (sourced) {
    return { ...sourced, from, to, practical: !sourced.historical };
  }
  const nearby = proximityEdge(from, to);
  if (nearby) return nearby;
  return {
    id: `rel-geo-order-${from}-${to}`,
    kind: "geographic-proximity",
    from,
    to,
    historical: false,
    practical: true,
    explanation: L(
      "This stop is sequenced for a practical walking order. Geographic order is not a historical relationship.",
      "Оваа постојка е наредена за практичен редослед на пешачење. Географскиот ред не е историска врска.",
      "Ovo stajalište je poređano radi praktičnog redosleda hoda. Geografski red nije istorijska veza.",
      "Bu durak pratik bir yürüyüş sırası için dizildi. Coğrafi sıra tarihî bir ilişki değildir.",
      "Цю зупинку вишикувано для практичного порядку ходи. Географічний порядок не є історичним зв'язком.",
     "Kjo ndalesë është radhitur për një rend praktik ecjeje. Rendi gjeografik nuk është një lidhje historike."),
    sourceIds: [],
    verificationStatus: "confirmed",
    themeIds: [],
  };
}

export function explainLegs(stops: string[]): GraphLeg[] {
  const legs: GraphLeg[] = [];
  for (let i = 1; i < stops.length; i += 1) {
    legs.push(explainLeg(stops[i - 1], stops[i]));
  }
  return legs;
}

export function connectedComponent(seed: string, themeId?: string): string[] {
  const seen = new Set<string>([seed]);
  const queue = [seed];
  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    for (const edge of edgesFor(current)) {
      if (themeId && !edge.themeIds.includes(themeId) && !edge.historical) continue;
      if (themeId && !edge.themeIds.includes(themeId) && edge.kind === "documented-route") {
        continue;
      }
      const next = otherEnd(edge, current);
      if (!next || seen.has(next) || next === current) continue;
      if (themeId && !edge.themeIds.includes(themeId) && !historicalEdgesFor(next).some((item) => item.themeIds.includes(themeId))) {
        if (!edge.historical || (themeId && !edge.themeIds.includes(themeId))) continue;
      }
      seen.add(next);
      queue.push(next);
    }
  }
  return [...seen];
}

export function allMappedSlugs() {
  return sites.filter((site) => Number.isFinite(site.coordinates.lat)).map((site) => site.slug);
}

export function historicalExplanation(leg: GraphLeg): Copy | null {
  if (!leg.historical) return null;
  return leg.explanation;
}
