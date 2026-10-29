import { sites } from "@/content/knowledge/catalog";
import { dishes, districts, venues } from "@/content/knowledge/culinary";
import { programmes } from "@/content/knowledge/programmes";
import { relations } from "@/content/knowledge/relations";
import type { Locale } from "@/i18n/locales";

export type AtlasHitKind = "site" | "district" | "venue" | "dish" | "event" | "person" | "style" | "period";

export type AtlasHit = {
  id: string;
  kind: AtlasHitKind;
  slug: string;
  mapped: boolean;
  municipality?: "centar" | "nearby";
};

function hay(locale: Locale, ...parts: Array<string | undefined | null>): string {
  return parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" \n ")
    .toLocaleLowerCase(locale);
}

function copyHay(locale: Locale, ...copies: Array<{ [k: string]: string } | undefined>) {
  const parts: string[] = [];
  for (const copy of copies) {
    if (!copy) continue;
    parts.push(...Object.values(copy));
  }
  return hay(locale, ...parts);
}

function blobOf(locale: Locale, ...copies: Array<{ [k: string]: string } | undefined | string | string[]>) {
  const parts: string[] = [];
  for (const item of copies) {
    if (!item) continue;
    if (typeof item === "string") parts.push(item);
    else if (Array.isArray(item)) parts.push(...item);
    else parts.push(...Object.values(item));
  }
  return hay(locale, ...parts);
}

function tokens(query: string) {
  return query
    .toLocaleLowerCase()
    .split(/[\s,./;:()]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

export function searchAtlas(query: string, locale: Locale): AtlasHit[] {
  const terms = tokens(query);
  if (!terms.length) return [];

  const hits: AtlasHit[] = [];

  for (const site of sites) {
    const blob = blobOf(
      locale,
      site.officialName,
      site.nameMk,
      site.alternativeNames,
      site.transliterations,
      site.summary,
      site.eyebrow,
      site.creator,
      site.commemorates,
      site.architecturalStyle,
      site.historicalPeriod,
      site.entityType,
      site.kinds,
    );
    if (terms.every((term) => blob.includes(term))) {
      hits.push({
        id: `site:${site.slug}`,
        kind: "site",
        slug: site.slug,
        mapped: Number.isFinite(site.coordinates.lat),
        municipality: site.municipality,
      });
    }
  }

  for (const district of districts) {
    const blob = copyHay(locale, district.name, district.summary, district.approach);
    if (terms.every((term) => blob.includes(term))) {
      hits.push({
        id: `district:${district.slug}`,
        kind: "district",
        slug: district.slug,
        mapped: true,
        municipality: district.municipality,
      });
    }
  }

  for (const venue of venues) {
    const blob = blobOf(locale, venue.name, venue.summary, venue.serves, venue.practical);
    if (terms.every((term) => blob.includes(term))) {
      hits.push({
        id: `venue:${venue.slug}`,
        kind: "venue",
        slug: venue.slug,
        mapped: Boolean(venue.coordinates),
        municipality: venue.municipality,
      });
    }
  }

  for (const dish of dishes) {
    const blob = copyHay(locale, dish.name, dish.eyebrow, dish.summary);
    if (terms.every((term) => blob.includes(term))) {
      hits.push({
        id: `dish:${dish.slug}`,
        kind: "dish",
        slug: dish.slug,
        mapped: false,
      });
    }
  }

  for (const event of programmes) {
    const blob = copyHay(locale, event.name, event.season, event.summary);
    if (terms.every((term) => blob.includes(term))) {
      hits.push({
        id: `event:${event.slug}`,
        kind: "event",
        slug: event.slug,
        mapped: event.venues.length > 0,
      });
    }
  }

  const people = new Map<string, string>();
  for (const site of sites) {
    if (site.creator) people.set(`creator:${site.slug}`, copyHay(locale, site.creator));
    if (site.commemorates) people.set(`person:${site.slug}`, copyHay(locale, site.commemorates));
  }
  for (const [id, text] of people) {
    if (terms.every((term) => text.includes(term))) {
      const slug = id.split(":")[1];
      hits.push({
        id,
        kind: "person",
        slug,
        mapped: true,
        municipality: getMunicipality(slug),
      });
    }
  }

  for (const site of sites) {
    if (site.architecturalStyle) {
      const text = copyHay(locale, site.architecturalStyle);
      if (terms.every((term) => text.includes(term))) {
        hits.push({
          id: `style:${site.slug}`,
          kind: "style",
          slug: site.slug,
          mapped: true,
          municipality: site.municipality,
        });
      }
    }
    if (site.historicalPeriod) {
      const period = copyHay(locale, site.historicalPeriod);
      if (terms.every((term) => period.includes(term))) {
        hits.push({
          id: `period:${site.slug}`,
          kind: "period",
          slug: site.slug,
          mapped: true,
          municipality: site.municipality,
        });
      }
    }
  }

  for (const edge of relations) {
    if (!edge.historical) continue;
    const blob = copyHay(locale, edge.explanation);
    if (terms.every((term) => blob.includes(term))) {
      hits.push({
        id: `rel:${edge.id}:${edge.from}`,
        kind: "site",
        slug: edge.from,
        mapped: true,
        municipality: getMunicipality(edge.from),
      });
    }
  }

  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.kind}:${hit.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getMunicipality(slug: string) {
  return sites.find((site) => site.slug === slug)?.municipality;
}
