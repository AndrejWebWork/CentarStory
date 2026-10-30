import { civicSites } from "@/content/knowledge/sites-civic";
import { coreSites } from "@/content/knowledge/sites-core";
import { institutionSites } from "@/content/knowledge/sites-institutions";
import { memorySites } from "@/content/knowledge/sites-memory";
import { coreMonumentsPart1 } from "@/content/knowledge/sites-monuments-a";
import { coreMonumentsPart2 } from "@/content/knowledge/sites-monuments-b";
import { coreMonumentsPart3 } from "@/content/knowledge/sites-monuments-c";
import { coreMonumentsPart4 } from "@/content/knowledge/sites-monuments-d";
import { coreMonumentsPart5 } from "@/content/knowledge/sites-monuments-e";
import { coreMonumentsPart6 } from "@/content/knowledge/sites-monuments-f";
import { coreMonumentsPart7 } from "@/content/knowledge/sites-monuments-g";
import { coreMonumentsPart8 } from "@/content/knowledge/sites-monuments-h";
import { coreMonumentsPart9 } from "@/content/knowledge/sites-monuments-i";
import { moreSites } from "@/content/knowledge/sites-more";
import { squareSites } from "@/content/knowledge/sites-square";
import { stageSites } from "@/content/knowledge/sites-stages";
import type { SiteRecord } from "@/content/knowledge/schema";

export const municipalMonuments: SiteRecord[] = [
  ...coreMonumentsPart1,
  ...coreMonumentsPart2,
  ...coreMonumentsPart3,
  ...coreMonumentsPart4,
  ...coreMonumentsPart5,
  ...coreMonumentsPart6,
  ...coreMonumentsPart7,
  ...coreMonumentsPart8,
  ...coreMonumentsPart9,
];

export const sites: SiteRecord[] = [
  ...coreSites,
  ...squareSites,
  ...memorySites,
  ...moreSites,
  ...institutionSites,
  ...stageSites,
  ...civicSites,
  ...municipalMonuments,
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
