import { pick } from "@/content/copy";
import { getSite } from "@/content/knowledge/catalog";
import type { Place } from "@/content/types";

export type FilmKind = "cavalry" | "company" | "museum" | "memorial" | "civic" | "ottoman" | "fortress";

const WARRIOR_SLUGS = new Set([
  "philip-ii-square-monument",
  "woman-warrior-monument",
  "fallen-heroes-monument",
  "macedonia-square",
  "macedonian-defenders-2001",
]);

const OTTOMAN_SLUGS = new Set(["daut-pasha-hammam"]);
const FORTRESS_SLUGS = new Set(["skopje-fortress"]);

export function filmKindFor(place: Place): FilmKind {
  const site = getSite(place.slug);
  const kinds = new Set([...(place.kinds ?? []), ...(site?.kinds ?? [])]);
  const entity = site?.entityType;
  const motif = place.motif;

  if (motif === "rider") return "cavalry";
  if (WARRIOR_SLUGS.has(place.slug)) return "company";
  if (OTTOMAN_SLUGS.has(place.slug) || motif === "dome") return "ottoman";
  if (FORTRESS_SLUGS.has(place.slug) || motif === "fort") return "fortress";
  if (
    kinds.has("museum") ||
    entity === "museum" ||
    motif === "museum" ||
    motif === "gallery" ||
    site?.institution === "collection" ||
    place.institution === "collection"
  ) {
    return "museum";
  }
  if (
    motif === "memorial" ||
    entity === "memorial" ||
    entity === "memorial-house" ||
    site?.institution === "memorial" ||
    place.institution === "memorial"
  ) {
    return "memorial";
  }
  return "civic";
}

function featuredYear(place: Place, locale: string) {
  const site = getSite(place.slug);
  if (site?.installationDate) return site.installationDate;
  const period = site?.historicalPeriod ? pick(site.historicalPeriod, locale) : pick(place.era, locale);
  const years = [...period.matchAll(/\d{4}/g)].map((match) => match[0]);
  if (years.length === 1) return years[0];
  return site?.milestones[0]?.date || years[0] || "";
}

export function filmFacts(place: Place, locale: string) {
  const site = getSite(place.slug);
  const year = site?.historicalPeriod ? pick(site.historicalPeriod, locale) : pick(place.era, locale);
  const yearShort = featuredYear(place, locale);
  const style = site?.architecturalStyle ? pick(site.architecturalStyle, locale) : "";
  return { year, yearShort, style, architecture: style };
}
