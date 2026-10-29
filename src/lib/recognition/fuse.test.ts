import assert from "node:assert/strict";
import { capDisplayedScore, decideOutcome, fuseCandidates } from "./fuse";

const coordinates = {
  "stone-bridge": { lat: 41.9971154, lng: 21.4332499 },
  "macedonia-square": { lat: 41.9956947, lng: 21.4312483 },
  "porta-macedonia": { lat: 41.9939, lng: 21.4316 },
};

function run() {
  const identified = fuseCandidates({
    mode: "remote",
    vision: [{ slug: "stone-bridge", score: 0.82, rationale: "arches" }],
    structure: [{ slug: "stone-bridge", score: 71 }],
    references: [],
    coordinates,
  });
  const identifiedDecision = decideOutcome("remote", identified);
  assert.equal(identifiedDecision.outcome, "identified");
  assert.ok((identified[0]?.score ?? 0) < 0.98);

  const ambiguous = fuseCandidates({
    mode: "remote",
    vision: [
      { slug: "macedonia-square", score: 0.61 },
      { slug: "porta-macedonia", score: 0.58 },
    ],
    structure: [],
    references: [],
    coordinates,
  });
  assert.equal(decideOutcome("remote", ambiguous).outcome, "candidates");
  assert.equal(ambiguous.length, 2);

  const gpsOnly = fuseCandidates({
    mode: "remote",
    vision: [],
    structure: [],
    references: [],
    location: coordinates["stone-bridge"],
    coordinates,
  });
  assert.equal(gpsOnly.length, 0);
  assert.equal(decideOutcome("remote", gpsOnly).outcome, "unknown");

  const weakImageNearGps = fuseCandidates({
    mode: "demo",
    vision: [],
    structure: [{ slug: "stone-bridge", score: 18 }],
    references: [{ slug: "stone-bridge", score: 0.12 }],
    location: coordinates["stone-bridge"],
    coordinates,
  });
  assert.equal(weakImageNearGps.length, 0);

  const proximityBoosts = fuseCandidates({
    mode: "remote",
    vision: [{ slug: "stone-bridge", score: 0.5 }],
    structure: [],
    references: [],
    location: coordinates["stone-bridge"],
    coordinates,
  });
  const withoutGps = fuseCandidates({
    mode: "remote",
    vision: [{ slug: "stone-bridge", score: 0.5 }],
    structure: [],
    references: [],
    coordinates,
  });
  assert.ok((proximityBoosts[0]?.score ?? 0) > (withoutGps[0]?.score ?? 0));
  assert.ok(proximityBoosts[0]?.sources.includes("proximity"));
  assert.ok((proximityBoosts[0]?.score ?? 1) <= 0.97);

  const bestReferenceKept = fuseCandidates({
    mode: "demo",
    vision: [],
    structure: [],
    references: [
      { slug: "stone-bridge", score: 0.41 },
      { slug: "stone-bridge", score: 0.93 },
      { slug: "macedonia-square", score: 0.55 },
    ],
    coordinates,
  });
  assert.ok((bestReferenceKept[0]?.score ?? 0) >= 0.85);
  assert.equal(bestReferenceKept[0]?.slug, "stone-bridge");

  const demoRefs = fuseCandidates({
    mode: "demo",
    vision: [],
    structure: [{ slug: "stone-bridge", score: 80 }],
    references: [{ slug: "stone-bridge", score: 0.91 }],
    coordinates,
  });
  assert.equal(decideOutcome("demo", demoRefs).outcome, "identified");
  assert.equal(capDisplayedScore(1), 97);
  assert.equal(capDisplayedScore(0.973), 97);

  console.log("recognition fusion tests passed");
}

run();
