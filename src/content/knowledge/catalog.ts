import { civicSites } from "@/content/knowledge/sites-civic";
import { coreSites } from "@/content/knowledge/sites-core";
import { institutionSites } from "@/content/knowledge/sites-institutions";
import { memorySites } from "@/content/knowledge/sites-memory";
import { moreSites } from "@/content/knowledge/sites-more";
import { squareSites } from "@/content/knowledge/sites-square";
import { stageSites } from "@/content/knowledge/sites-stages";
import type { SiteRecord } from "@/content/knowledge/schema";

export const sites: SiteRecord[] = [
  ...coreSites,
  ...squareSites,
  ...memorySites,
  ...moreSites,
  ...institutionSites,
  ...stageSites,
  ...civicSites,
];

const bySlug = new Map(sites.map((site) => [site.slug, site]));

export function getSite(slug: string) {
  return bySlug.get(slug);
}

export function sitesInCentar() {
  return sites.filter((site) => site.municipality === "centar");
}

export function nearbySites() {
  return sites.filter((site) => site.municipality === "nearby");
}

export function institutionSitesList() {
  return sites.filter((site) => site.institution);
}
