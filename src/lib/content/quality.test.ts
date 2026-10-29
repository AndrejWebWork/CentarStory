import assert from "node:assert/strict";
import { buildQualityReport } from "@/lib/content/quality";
import { validateKnowledge } from "@/lib/content/validate";

function run() {
  const errors = validateKnowledge().filter((issue) => issue.level === "error");
  assert.equal(errors.length, 0, errors.map((issue) => `${issue.code} ${issue.subject}`).join("\n"));
  const report = buildQualityReport();
  assert.equal(report.counts.sites, 22);
  assert.equal(report.counts.locales, 5);
  assert.equal(report.boundary.outsideMarkedCentar.length, 0);
  assert.ok(report.counts.venues >= 2);
  console.log("quality ok", report.counts);
}

run();
