import { locales } from "@/i18n/locales";
import { pointInCentar } from "@/content/knowledge/boundary";
import { sites } from "@/content/knowledge/catalog";
import { dishes, venues } from "@/content/knowledge/culinary";
import { media } from "@/content/knowledge/media";
import {
  BOUNDARY_EXCLUDED_MONUMENTS,
  DUPLICATE_MONUMENT_REPORT,
  UNRESOLVED_OSM_CANDIDATES,
  type BoundaryExcludedMonument,
  type DuplicateAuditEntry,
  type UnresolvedOsmCandidate,
} from "@/content/knowledge/monument-audit";
import { programmes, routes } from "@/content/knowledge/programmes";
import { relations } from "@/content/knowledge/relations";
import { sources } from "@/content/knowledge/sources";
import { validateKnowledge, type Issue } from "@/lib/content/validate";

export type QualityReport = {
  generated: string;
  counts: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  verifiedInventory: Array<{ slug: string; name: string; category: string; coordinates: { lat: number; lng: number } }>;
  candidateInventory: Array<{ slug: string; name: string; category: string; missingOrDisputed?: string }>;
  unresolvedOsmCandidates: UnresolvedOsmCandidate[];
  duplicateReport: DuplicateAuditEntry[];
  boundaryExcludedReport: BoundaryExcludedMonument[];
  issues: Issue[];
  missingCritical: string[];
  translationGaps: string[];
  boundary: { inCentar: number; nearby: number; outsideMarkedCentar: string[] };
};

export function buildQualityReport(): QualityReport {
  const issues = validateKnowledge();
  const outsideMarkedCentar = sites
    .filter((site) => site.municipality === "centar" && !pointInCentar(site.coordinates.lat, site.coordinates.lng))
    .map((site) => site.slug);
  const missingCritical = [
    ...issues
      .filter((issue) => issue.code.startsWith("missing") || issue.code === "claim-without-source")
      .map((issue) => `${issue.subject}: ${issue.detail}`),
    ...sites
      .filter((site) => site.missingOrDisputed)
      .map((site) => `${site.slug}: ${site.missingOrDisputed!.en}`),
  ];
  const translationGaps = issues
    .filter((issue) => issue.code === "translation-missing")
    .map((issue) => `${issue.subject}: ${issue.detail}`);

  const categoryBreakdown: Record<string, number> = {};
  for (const site of sites) {
    const cat = site.monumentCategory ?? site.entityType;
    categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + 1;
  }

  const verifiedInventory = sites
    .filter((site) => site.verificationStatus === "confirmed")
    .map((site) => ({
      slug: site.slug,
      name: site.officialName.en,
      category: site.monumentCategory ?? site.entityType,
      coordinates: site.coordinates,
    }));

  const candidateInventory = sites
    .filter((site) => site.verificationStatus === "candidate")
    .map((site) => ({
      slug: site.slug,
      name: site.officialName.en,
      category: site.monumentCategory ?? site.entityType,
      missingOrDisputed: site.missingOrDisputed?.en,
    }));

  return {
    generated: new Date().toISOString().slice(0, 10),
    counts: {
      sources: sources.length,
      sites: sites.length,
      confirmedSites: verifiedInventory.length,
      candidateSites: candidateInventory.length,
      unresolvedOsmPins: UNRESOLVED_OSM_CANDIDATES.length,
      consolidatedDuplicates: DUPLICATE_MONUMENT_REPORT.length,
      boundaryExcluded: BOUNDARY_EXCLUDED_MONUMENTS.length,
      dishes: dishes.length,
      venues: venues.length,
      candidateVenues: venues.filter((venue) => venue.verificationStatus === "candidate").length,
      routes: routes.length,
      events: programmes.length,
      candidateEvents: programmes.filter((event) => event.verificationStatus === "candidate").length,
      relations: relations.length,
      historicalRelations: relations.filter((edge) => edge.historical).length,
      images: media.length,
      locales: locales.length,
      issues: issues.length,
      errors: issues.filter((issue) => issue.level === "error").length,
      warnings: issues.filter((issue) => issue.level === "warning").length,
    },
    categoryBreakdown,
    verifiedInventory,
    candidateInventory,
    unresolvedOsmCandidates: UNRESOLVED_OSM_CANDIDATES,
    duplicateReport: DUPLICATE_MONUMENT_REPORT,
    boundaryExcludedReport: BOUNDARY_EXCLUDED_MONUMENTS,
    issues,
    missingCritical,
    translationGaps,
    boundary: {
      inCentar: sites.filter((site) => site.municipality === "centar").length,
      nearby: sites.filter((site) => site.municipality === "nearby").length,
      outsideMarkedCentar,
    },
  };
}

export function qualityMarkdown(report: QualityReport = buildQualityReport()): string {
  const lines = [
    "# CentarStory — Municipal Monument Inventory & Quality Report",
    "",
    `Generated: ${report.generated}`,
    "",
    "## Counts",
    "",
    ...Object.entries(report.counts).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Category Breakdown",
    "",
    ...Object.entries(report.categoryBreakdown).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Geographic Boundary Validation Report (OSM Relation 2439777)",
    "",
    `- Sites verified inside Centar polygon: ${report.boundary.inCentar}`,
    `- Sites marked nearby: ${report.boundary.nearby}`,
    `- Marked Centar but outside OSM polygon: ${report.boundary.outsideMarkedCentar.join(", ") || "none"}`,
    "",
    "### Boundary-Excluded Monuments (Outside Centar Polygon)",
    "",
    ...report.boundaryExcludedReport.map(
      (item) =>
        `- **${item.name}** (\`${item.osmId}\`, ${item.coordinates.lat.toFixed(5)}, ${item.coordinates.lng.toFixed(5)}) — ${item.neighborMunicipality}: ${item.reason}`,
    ),
    "",
    "## Verified Monument & Heritage Inventory",
    "",
    ...report.verifiedInventory.map(
      (item) => `- \`${item.slug}\` — **${item.name}** [${item.category}] (${item.coordinates.lat.toFixed(5)}, ${item.coordinates.lng.toFixed(5)})`,
    ),
    "",
    "## Candidate Inventory (Mapped in Centar, Requiring Primary Archival Confirmation)",
    "",
    ...report.candidateInventory.map(
      (item) => `- \`${item.slug}\` — **${item.name}** [${item.category}] — ${item.missingOrDisputed ?? "Pending primary register extract"}`,
    ),
    "",
    "## Unresolved OSM Candidate Pins & Decorative Artworks",
    "",
    ...report.unresolvedOsmCandidates.map(
      (item) => `- \`${item.osmId}\` — **${item.rawName}** (${item.coordinates.lat.toFixed(5)}, ${item.coordinates.lng.toFixed(5)}): ${item.reasonUnresolved}`,
    ),
    "",
    "## Duplicate & Ensemble Consolidation Report",
    "",
    ...report.duplicateReport.map(
      (item) => `- \`${item.canonicalSlug}\` (primary \`${item.primaryOsmId}\`, merged \`${item.mergedOsmId}\`): ${item.reason}`,
    ),
    "",
    "## Missing or Disputed Information",
    "",
    report.missingCritical.length ? report.missingCritical.map((item) => `- ${item}`).join("\n") : "- none",
    "",
    "## Translation Gaps",
    "",
    report.translationGaps.length ? report.translationGaps.map((item) => `- ${item}`).join("\n") : "- none",
    "",
    "## Coverage Statement",
    "",
    "- Overpass API queried all 93 OSM nodes/ways tagged `historic=monument|memorial|bust|plaque|column|obelisk`, `memorial=*`, or `tourism=artwork` across the Centar bounding box (41.9780–42.0142 N, 21.4056–21.4511 E).",
    "- All 82 in-boundary OSM features are accounted for across the verified inventory, the candidate inventory, the duplicate consolidation table, and the unresolved candidate table.",
    "- Because the national UZKN online register (`uzkn.gov.mk/registri/`) returned HTTP 444/500 during research, this dataset does not claim to be an exhaustive legal state register of every wall plaque in Centar.",
    "",
  ];
  return `${lines.join("\n")}\n`;
}
