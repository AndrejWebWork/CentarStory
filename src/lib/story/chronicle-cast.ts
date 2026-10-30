import { pick } from "@/content/copy";
import { getSite } from "@/content/knowledge/catalog";
import { getMedia } from "@/content/knowledge/media";
import type { MediaAsset } from "@/content/knowledge/schema";
import { getPlace, sitePath } from "@/content/places";
import type { Motif, Place } from "@/content/types";
import { explainLeg, historicalEdgesFor, otherEnd } from "@/lib/graph/query";

export type ChronicleRole = "rider" | "warrior" | "place" | "house";

export type ChronicleFigure = {
  slug: string;
  name: string;
  eyebrow: string;
  role: ChronicleRole;
  href: string;
  explanation: string;
  motif: Motif;
  palette: [string, string];
  image?: MediaAsset;
  imageAlt: string;
  side: "left" | "right";
};

const WARRIOR_SLUGS = new Set([
  "philip-ii-square-monument",
  "woman-warrior-monument",
  "fallen-heroes-monument",
  "macedonia-square",
  "macedonian-defenders-2001",
]);

function roleOf(place: Place): ChronicleRole {
  if (place.motif === "rider") return "rider";
  if (WARRIOR_SLUGS.has(place.slug)) return "warrior";
  if (place.institution || place.kinds.includes("museum")) return "house";
  return "place";
}

function scoreFigure(place: Place, historical: boolean, image?: MediaAsset) {
  let score = 0;
  if (place.motif === "rider") score += 8;
  if (WARRIOR_SLUGS.has(place.slug)) score += 6;
  if (image) score += 4;
  if (historical) score += 3;
  return score;
}

function toFigure(place: Place, locale: string, explanation: string, index: number): ChronicleFigure {
  const site = getSite(place.slug);
  const image = site?.images[0] ? getMedia(site.images[0]) : undefined;
  return {
    slug: place.slug,
    name: pick(place.name, locale),
    eyebrow: pick(place.eyebrow, locale),
    role: roleOf(place),
    href: sitePath(place),
    explanation,
    motif: place.motif,
    palette: place.palette,
    image,
    imageAlt: image ? pick(image.caption, locale) : pick(place.name, locale),
    side: index % 2 === 0 ? "left" : "right",
  };
}

export function chronicleCast(origin: Place, locale: string, limit = 5): ChronicleFigure[] {
  const seen = new Set<string>([origin.slug]);
  const raw: Array<{ place: Place; historical: boolean; explanation: string }> = [];
  const originSite = getSite(origin.slug);
  const hostExplanation = originSite?.architecturalStyle
    ? pick(originSite.architecturalStyle, locale)
    : pick(origin.story[0], locale);
  const host = toFigure(origin, locale, hostExplanation, 0);

  for (const slug of origin.related) {
    const next = getPlace(slug);
    if (!next || seen.has(next.slug)) continue;
    seen.add(next.slug);
    const leg = explainLeg(origin.slug, next.slug);
    raw.push({ place: next, historical: leg.historical, explanation: pick(leg.explanation, locale) });
  }

  for (const edge of historicalEdgesFor(origin.slug)) {
    const slug = otherEnd(edge, origin.slug);
    if (!slug) continue;
    const next = getPlace(slug);
    if (!next || seen.has(next.slug)) continue;
    seen.add(next.slug);
    raw.push({
      place: next,
      historical: true,
      explanation: pick(edge.explanation, locale),
    });
  }

  const ranked = raw
    .map((item) => {
      const site = getSite(item.place.slug);
      const image = site?.images[0] ? getMedia(site.images[0]) : undefined;
      return { ...item, image, score: scoreFigure(item.place, item.historical, image) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, limit - 1));

  const rest = ranked.map((item, index) => toFigure(item.place, locale, item.explanation, index + 1));
  return [host, ...rest];
}
