import assert from "node:assert/strict";
import { venues } from "@/content/knowledge/culinary";
import { relations } from "@/content/knowledge/relations";
import { getSite } from "@/content/knowledge/catalog";
import { getSource } from "@/content/knowledge/sources";
import { validateKnowledge } from "@/lib/content/validate";
import { bestEdge, explainLeg, historicalEdgesFor, sitesByTheme } from "@/lib/graph/query";

function run() {
  const errors = validateKnowledge().filter((issue) => issue.level === "error");
  assert.equal(errors.length, 0, errors.map((issue) => `${issue.code} ${issue.subject}`).join("\n"));

  const destan = venues.find((venue) => venue.slug === "destan");
  assert.ok(destan);
  assert.equal(destan.coordinates, undefined);

  const stevanovska = bestEdge("macedonia-square", "porta-macedonia");
  assert.ok(stevanovska);
  assert.equal(stevanovska.historical, true);
  assert.ok(["same-creator", "architectural-movement"].includes(stevanovska.kind));
  assert.ok(stevanovska.sourceIds.length > 0);
  for (const id of stevanovska.sourceIds) assert.ok(getSource(id));

  const earthquake = bestEdge("old-railway-station", "mother-teresa-house");
  assert.ok(earthquake);
  assert.equal(earthquake.kind, "same-event");
  assert.equal(earthquake.historical, true);

  const ottoman = bestEdge("stone-bridge", "daut-pasha-hammam");
  assert.ok(ottoman);
  assert.equal(ottoman.kind, "same-period");
  assert.match(ottoman.explanation.en, /not a claim that the two were designed as a pair/i);

  const proximity = explainLeg("assembly", "city-park");
  assert.equal(proximity.historical, false);
  assert.equal(proximity.kind, "geographic-proximity");

  assert.ok(sitesByTheme("skopje-2014").includes("porta-macedonia"));
  assert.ok(historicalEdgesFor("macedonia-square").length > 0);

  for (const edge of relations) {
    assert.notEqual(edge.kind, "geographic-proximity");
    if (edge.historical) assert.ok(edge.sourceIds.length > 0);
    assert.ok(getSite(edge.from));
    assert.ok(getSite(edge.to));
  }

  assert.ok(getSite("stone-bridge")?.coordinates);
  console.log("graph ok", relations.length, "edges");
}

run();
