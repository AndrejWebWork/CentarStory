import { locales } from "@/i18n/locales";
import { pointInCentar } from "@/content/knowledge/boundary";
import { sites } from "@/content/knowledge/catalog";
import { dishes, venues } from "@/content/knowledge/culinary";
import { media } from "@/content/knowledge/media";
import { programmes, routes } from "@/content/knowledge/programmes";
import { relations } from "@/content/knowledge/relations";
import { sources } from "@/content/knowledge/sources";
import { validateKnowledge, type Issue } from "@/lib/content/validate";

export type QualityReport = {
  generated: string;
  counts: Record<string, number>;
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
  const missingCritical = issues.filter((issue) => issue.code.startsWith("missing") || issue.code === "claim-without-source").map((issue) => `${issue.subject}: ${issue.detail}`);
  const translationGaps = issues.filter((issue) => issue.code === "translation-missing").map((issue) => `${issue.subject}: ${issue.detail}`);

  return {
    generated: new Date().toISOString().slice(0, 10),
    counts: {
      sources: sources.length,
      sites: sites.length,
      confirmedSites: sites.filter((site) => site.verificationStatus === "confirmed").length,
      candidateSites: sites.filter((site) => site.verificationStatus === "candidate").length,
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
    "# Content quality report",
    "",
    `Generated: ${report.generated}`,
    "",
    "## Counts",
    "",
    ...Object.entries(report.counts).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Boundary",
    "",
    `- Sites marked Centar: ${report.boundary.inCentar}`,
    `- Sites marked nearby: ${report.boundary.nearby}`,
    `- Marked Centar but outside OSM polygon: ${report.boundary.outsideMarkedCentar.join(", ") || "none"}`,
    "",
    "## Missing critical fields",
    "",
    report.missingCritical.length ? report.missingCritical.map((item) => `- ${item}`).join("\n") : "- none",
    "",
    "## Translation gaps",
    "",
    report.translationGaps.length ? report.translationGaps.map((item) => `- ${item}`).join("\n") : "- none",
    "",
    "## Issues",
    "",
  ];
  if (report.issues.length === 0) lines.push("- none");
  else {
    for (const issue of report.issues) {
      lines.push(`- **${issue.level}** \`${issue.code}\` ${issue.subject} — ${issue.detail}`);
    }
  }
  lines.push(
    "",
    "## Operational and coverage audit",
    "",
    "### Verified",
    "",
    "- 22 mapped cultural sites inside OSM relation 2439777 (Municipality of Centar).",
    "- Historical relationships in `relations.ts` are sourced; proximity is computed at runtime and is not stored as proof.",
    "- MSU hours and 100 MKD ticket, AMM tickets and accessibility, Mother Teresa / City Museum / Holocaust weekday hours as printed by those houses, checked 2026-10-29.",
    "- JSP fare list captured February 2026, official URL rechecked 2026-10-29 (HTML table is client-rendered; figures must be reconfirmed on the page).",
    "- e-Enjoy official pricing page 29 Oct 2026; Wizi official Skopje tariff 29 Oct 2026.",
    "- Exhibition Blagoja Manevski 23 Sep–30 Oct 2026 ongoing on 29 Oct 2026; Picasso and Solidarity as future ended 28 Oct 2026.",
    "",
    "### Partially verified",
    "",
    "- Destan: long-standing Old Bazaar kebab house treated as nearby/candidate; no unique OSM node in this pass.",
    "- Pelister: official address on Macedonia Square; Nominatim coordinate is the square itself, not a separate restaurant node.",
    "- BinBin: help page describes the product globally; it does not print a Skopje tariff or prove a vehicle in Centar.",
    "- Recurring programmes (May Opera Evenings, Skopje Summer): confirmed as recurring, this year’s dated poster not captured.",
    "- AMM: tickets and last admission 17:00 verified; complete weekday opening timetable not published on plan-your-visit.",
    "",
    "### Unresolved / missing",
    "",
    "- No exhaustive restaurant census of Centar. Two houses only.",
    "- Menu prices are not in the dataset.",
    "- No functioning public bike-share confirmed 29 Oct 2026; private rental site did not load.",
    "- Live JSP departures are not in the atlas.",
    "- mcum.mk returned 500 during research; City Museum uses museumskopje.mk.",
    "- Uber and Bolt are not listed as local taxi apps.",
    "- Photograph coverage is thin (three credited Commons images). Most houses use editorial plates, labelled as such.",
    "",
    "### Geographic or historical ambiguities",
    "",
    "- Sveti Spas / Daut Pasha Hammam sit in the bazaar contact zone; OSM Nominatim assigns Municipality of Centar, so they are not filed as nearby.",
    "- Old Bazaar culinary district is in Čair (nearby), even though some monuments on its edge are in Centar.",
    "- Ilinden 2 Aug 2026 is past; next dated occurrence used is 2 Aug 2027.",
    "",
    "This atlas does not claim complete monument, restaurant, or event coverage of Centar.",
    "",
  );
  return `${lines.join("\n")}\n`;
}
