import { getSite, sites } from "@/content/knowledge/catalog";
import type { SiteRecord } from "@/content/knowledge/schema";

export type AtlasFilter =
  | "all"
  | "monuments"
  | "memorials"
  | "buildings"
  | "architecture"
  | "museums"
  | "food"
  | "events"
  | "transport"
  | "walks";

export const ATLAS_FILTERS: AtlasFilter[] = [
  "all",
  "monuments",
  "memorials",
  "buildings",
  "architecture",
  "museums",
  "food",
  "events",
  "transport",
  "walks",
];

function isArchitecture(site: SiteRecord) {
  const style = `${site.architecturalStyle?.en ?? ""} ${site.entityType}`;
  return /Skopje 2014|Ottoman|modernist|palace|arch|hammam|cathedral|Interwar|historic-building|religious-building/i.test(
    style,
  );
}

export function siteMatchesFilter(site: SiteRecord, filter: AtlasFilter): boolean {
  if (filter === "all" || filter === "walks" || filter === "events" || filter === "food" || filter === "transport") {
    return filter === "all";
  }
  if (filter === "monuments") return site.kinds.includes("monument");
  if (filter === "memorials") return site.kinds.includes("memorial") || site.entityType === "memorial";
  if (filter === "buildings") return site.kinds.includes("building") || site.kinds.includes("worship");
  if (filter === "architecture") return isArchitecture(site);
  if (filter === "museums") return site.kinds.includes("museum") || Boolean(site.institution);
  return false;
}

export function filteredSites(filter: AtlasFilter) {
  if (filter === "all") return sites;
  return sites.filter((site) => siteMatchesFilter(site, filter));
}

export function siteBySlug(slug: string) {
  return getSite(slug);
}
