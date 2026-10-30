import assert from "node:assert/strict";
import { buildQualityReport, qualityMarkdown } from "@/lib/content/quality";
import { validateKnowledge } from "@/lib/content/validate";
import { profiles } from "@/lib/recognition/profiles";
import { visionCatalogue } from "@/lib/recognition/catalogue";

function run() {
  const errors = validateKnowledge().filter((issue) => issue.level === "error");
  assert.equal(errors.length, 0, errors.map((issue) => `${issue.code} ${issue.subject}`).join("\n"));
  const report = buildQualityReport();
  assert.ok(report.counts.sites >= 50);
  assert.equal(report.counts.confirmedSites + report.counts.candidateSites, report.counts.sites);
  assert.equal(report.counts.candidateSites, 4);
  assert.equal(report.counts.locales, 6);
  assert.equal(report.boundary.outsideMarkedCentar.length, 0);
  assert.ok(report.counts.venues >= 2);
  assert.equal(visionCatalogue().length, report.counts.sites);
  assert.equal(profiles.length, report.counts.sites);
  assert.ok(report.duplicateReport.length >= 8);
  assert.ok(report.unresolvedOsmCandidates.length >= 10);
  assert.ok(report.boundaryExcludedReport.length >= 5);
  const md = qualityMarkdown(report);
  assert.ok(md.includes("Duplicate & Ensemble Consolidation Report"));
  console.log("quality ok", report.counts);
}

run();
