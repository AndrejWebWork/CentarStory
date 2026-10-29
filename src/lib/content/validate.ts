import { locales, type Locale } from "@/i18n/locales";
import { pointInCentar, haversineMeters } from "@/content/knowledge/boundary";
import { sites, getSite } from "@/content/knowledge/catalog";
import { dishes, districts, venues } from "@/content/knowledge/culinary";
import { media, getMedia } from "@/content/knowledge/media";
import { programmes, routes } from "@/content/knowledge/programmes";
import { visitOps } from "@/content/knowledge/visit-ops";
import { relations } from "@/content/knowledge/relations";
import type { Copy } from "@/content/types";
import { getSource } from "@/content/knowledge/sources";
import type { Claim, SiteRecord } from "@/content/knowledge/schema";

export type Issue = {
  level: "error" | "warning";
  code: string;
  subject: string;
  detail: string;
};

function copyComplete(copy: Copy, subject: string, issues: Issue[]) {
  for (const locale of locales) {
    if (!copy[locale as Locale]?.trim()) {
      issues.push({
        level: "error",
        code: "translation-missing",
        subject,
        detail: `Missing ${locale} text`,
      });
    }
  }
}

function claimsOf(site: SiteRecord): Claim[] {
  return [...site.claims, ...site.myths];
}

export function validateKnowledge(): Issue[] {
  const issues: Issue[] = [];
  const slugs = new Set<string>();
  const claimKeys = new Set<string>();

  for (const site of sites) {
    if (slugs.has(site.slug)) {
      issues.push({ level: "error", code: "duplicate-slug", subject: site.slug, detail: "Duplicate site slug" });
    }
    slugs.add(site.slug);

    const critical = [
      site.officialName,
      site.summary,
      site.story[0],
      site.story[1],
      site.visit,
      site.address,
      site.eyebrow,
      site.era,
      site.significance,
    ];
    for (const [index, copy] of critical.entries()) {
      copyComplete(copy, `${site.slug}#${index}`, issues);
    }

    if (!site.nameMk.trim()) {
      issues.push({ level: "error", code: "missing-mk-name", subject: site.slug, detail: "Missing Macedonian name" });
    }
    if (!Number.isFinite(site.coordinates.lat) || !Number.isFinite(site.coordinates.lng)) {
      issues.push({ level: "error", code: "missing-coordinates", subject: site.slug, detail: "Coordinates required" });
    }
    if (!getSource(site.coordinateSourceId)) {
      issues.push({ level: "error", code: "unknown-source", subject: site.slug, detail: site.coordinateSourceId });
    }

    const inside = pointInCentar(site.coordinates.lat, site.coordinates.lng);
    if (site.municipality === "centar" && !inside) {
      issues.push({
        level: "error",
        code: "outside-centar",
        subject: site.slug,
        detail: "Marked as Centar but outside OSM relation 2439777",
      });
    }
    if (site.municipality === "nearby" && inside) {
      issues.push({
        level: "warning",
        code: "nearby-inside-polygon",
        subject: site.slug,
        detail: "Marked nearby but the pin is inside the Centar polygon",
      });
    }

    for (const related of site.related) {
      if (!getSite(related)) {
        issues.push({ level: "error", code: "unknown-related", subject: site.slug, detail: related });
      }
    }
    for (const imageId of site.images) {
      if (!getMedia(imageId)) {
        issues.push({ level: "error", code: "unknown-image", subject: site.slug, detail: imageId });
      }
    }
    for (const claim of claimsOf(site)) {
      const key = `${site.id}:${claim.id}`;
      if (claimKeys.has(key)) {
        issues.push({ level: "error", code: "duplicate-claim", subject: site.slug, detail: claim.id });
      }
      claimKeys.add(key);
      copyComplete(claim.text, `${site.slug}/${claim.id}`, issues);
      for (const sourceId of claim.sourceIds) {
        if (!getSource(sourceId)) {
          issues.push({ level: "error", code: "unknown-source", subject: `${site.slug}/${claim.id}`, detail: sourceId });
        }
      }
      if (claim.sourceIds.length === 0) {
        issues.push({ level: "error", code: "claim-without-source", subject: site.slug, detail: claim.id });
      }
    }
    if (!site.lastChecked) {
      issues.push({ level: "error", code: "missing-last-checked", subject: site.slug, detail: "lastChecked required" });
    }
  }

  for (let i = 0; i < sites.length; i += 1) {
    for (let j = i + 1; j < sites.length; j += 1) {
      const a = sites[i];
      const b = sites[j];
      const meters = haversineMeters(a.coordinates, b.coordinates);
      if (meters < 12 && a.officialName.en === b.officialName.en) {
        issues.push({
          level: "error",
          code: "duplicate-record",
          subject: `${a.slug}|${b.slug}`,
          detail: `Pins ${Math.round(meters)} m apart with the same English name`,
        });
      }
    }
  }

  const dishSlugs = new Set(dishes.map((dish) => dish.slug));
  const districtSlugs = new Set(districts.map((district) => district.slug));
  for (const district of districts) {
    const inside = pointInCentar(district.coordinates.lat, district.coordinates.lng);
    if (district.municipality === "centar" && !inside) {
      issues.push({
        level: "error",
        code: "outside-centar",
        subject: district.slug,
        detail: "District marked as Centar but outside OSM relation 2439777",
      });
    }
    if (district.municipality === "nearby" && inside) {
      issues.push({
        level: "warning",
        code: "nearby-inside-polygon",
        subject: district.slug,
        detail: "District marked nearby but the pin is inside the Centar polygon",
      });
    }
    copyComplete(district.name, `district:${district.slug}:name`, issues);
    copyComplete(district.summary, `district:${district.slug}:summary`, issues);
  }
  for (const dish of dishes) {
    copyComplete(dish.name, `dish:${dish.slug}:name`, issues);
    copyComplete(dish.summary, `dish:${dish.slug}:summary`, issues);
    for (const claim of [...dish.claims, ...dish.myths]) {
      copyComplete(claim.text, `dish:${dish.slug}/${claim.id}`, issues);
      if (claim.sourceIds.length === 0) {
        issues.push({ level: "error", code: "claim-without-source", subject: `dish:${dish.slug}`, detail: claim.id });
      }
    }
  }
  for (const venue of venues) {
    if (!districtSlugs.has(venue.district)) {
      issues.push({ level: "error", code: "unknown-district", subject: venue.slug, detail: venue.district });
    }
    for (const dish of venue.serves) {
      if (!dishSlugs.has(dish)) {
        issues.push({ level: "error", code: "unknown-dish", subject: venue.slug, detail: dish });
      }
    }
  }

  for (const route of routes) {
    for (const stop of route.stops) {
      if (!getSite(stop)) {
        issues.push({ level: "error", code: "unknown-stop", subject: route.slug, detail: stop });
      }
    }
  }
  for (const event of programmes) {
    for (const venue of event.venues) {
      if (!getSite(venue)) {
        issues.push({ level: "error", code: "unknown-venue", subject: event.slug, detail: venue });
      }
    }
    if (!event.officialUrl?.startsWith("http")) {
      issues.push({ level: "error", code: "event-missing-url", subject: event.slug, detail: "officialUrl required" });
    }
    if (event.calendar.kind === "annual-fixed-date" && (!event.calendar.month || !event.calendar.day)) {
      issues.push({ level: "error", code: "event-incomplete-calendar", subject: event.slug, detail: "month and day required" });
    }
    if (event.calendar.kind === "dated-run" && (!event.calendar.startDate || !event.calendar.endDate)) {
      issues.push({
        level: "error",
        code: "event-incomplete-calendar",
        subject: event.slug,
        detail: "dated-run requires startDate and endDate",
      });
    }
  }

  const relationIds = new Set<string>();
  for (const edge of relations) {
    if (relationIds.has(edge.id)) {
      issues.push({ level: "error", code: "duplicate-relation", subject: edge.id, detail: "Duplicate relationship id" });
    }
    relationIds.add(edge.id);
    copyComplete(edge.explanation, `relation:${edge.id}`, issues);
    if (edge.kind === "geographic-proximity") {
      issues.push({
        level: "error",
        code: "static-proximity",
        subject: edge.id,
        detail: "Geographic proximity must be computed at runtime, not stored as a historical fact",
      });
    }
    if (edge.historical && edge.sourceIds.length === 0) {
      issues.push({ level: "error", code: "relation-without-source", subject: edge.id, detail: edge.kind });
    }
    if (!getSite(edge.from)) {
      issues.push({ level: "error", code: "unknown-relation-end", subject: edge.id, detail: edge.from });
    }
    if (!getSite(edge.to)) {
      issues.push({ level: "error", code: "unknown-relation-end", subject: edge.id, detail: edge.to });
    }
    for (const sourceId of edge.sourceIds) {
      if (!getSource(sourceId)) {
        issues.push({ level: "error", code: "unknown-source", subject: edge.id, detail: sourceId });
      }
    }
  }

  for (const ops of visitOps) {
    if (!getSite(ops.slug)) {
      issues.push({ level: "error", code: "unknown-visit-site", subject: ops.slug, detail: "visit-ops slug" });
    }
    copyComplete(ops.timetable, `visit:${ops.slug}:timetable`, issues);
    if (ops.tickets) copyComplete(ops.tickets, `visit:${ops.slug}:tickets`, issues);
    if (ops.accessibility) copyComplete(ops.accessibility, `visit:${ops.slug}:access`, issues);
    for (const sourceId of ops.sourceIds) {
      if (!getSource(sourceId)) {
        issues.push({ level: "error", code: "unknown-source", subject: ops.slug, detail: sourceId });
      }
    }
  }

  for (const item of media) {
    if (!item.authenticPhotograph) {
      issues.push({ level: "error", code: "non-authentic-image", subject: item.id, detail: item.fileTitle });
    }
    if (!item.license || !item.credit) {
      issues.push({ level: "error", code: "image-missing-rights", subject: item.id, detail: "License and credit required" });
    }
  }

  return issues;
}

export function assertKnowledge() {
  const errors = validateKnowledge().filter((issue) => issue.level === "error");
  if (errors.length > 0) {
    throw new Error(errors.map((issue) => `${issue.code} ${issue.subject}: ${issue.detail}`).join("\n"));
  }
}
