import assert from "node:assert/strict";
import { PRECOMPUTED_REFERENCE_EMBEDDINGS } from "./embeddings";
import { capDisplayedScore, decideOutcome, fuseCandidates } from "./fuse";
import { embeddingSimilarity, evaluateLocalSamples } from "./on-device";
import { recognitionConfig, recognizeOnServer } from "./server";

const coordinates = {
  "stone-bridge": { lat: 41.9971154, lng: 21.4332499 },
  "macedonia-square": { lat: 41.9956947, lng: 21.4312483 },
  "porta-macedonia": { lat: 41.9939, lng: 21.4316 },
};

function makePatch(r: number, g: number, b: number) {
  const data = new Uint8ClampedArray(32 * 24 * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
  return { width: 32, height: 24, data, colorSpace: "srgb" as const };
}

async function run() {
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

  // Precomputed reference embeddings: self-similarity must be 1 and discriminate different monuments.
  assert.ok(PRECOMPUTED_REFERENCE_EMBEDDINGS.length >= 10);
  const gruevRef = PRECOMPUTED_REFERENCE_EMBEDDINGS.find((item) => item.slug === "dame-gruev-square")!;
  const plaqueRef = PRECOMPUTED_REFERENCE_EMBEDDINGS.find((item) => item.slug === "karposh-execution-plaque")!;
  assert.ok(embeddingSimilarity(gruevRef, gruevRef) > 0.99);
  assert.ok(embeddingSimilarity(gruevRef, gruevRef) - embeddingSimilarity(gruevRef, plaqueRef) > 0.25);

  const gruevEval = evaluateLocalSamples({
    evidence: {
      brightness: 0.52,
      warmth: 0.58,
      saturation: 0.22,
      green: 0.08,
      horizontal: 0.42,
      vertical: 0.58,
    },
    precomputedScores: PRECOMPUTED_REFERENCE_EMBEDDINGS.map((ref) => ({
      slug: ref.slug,
      score: embeddingSimilarity(gruevRef, ref),
    })),
  });
  assert.equal(gruevEval.result.outcome, "identified");
  assert.equal(gruevEval.result.candidates[0]?.slug, "dame-gruev-square");

  // Paid providers must be rejected even if an API key is set.
  const prevKey = process.env.RECOGNITION_API_KEY;
  const prevProvider = process.env.RECOGNITION_PROVIDER;
  const prevFree = process.env.RECOGNITION_FREE_TIER;
  try {
    process.env.RECOGNITION_API_KEY = "test-key";
    process.env.RECOGNITION_PROVIDER = "openai";
    process.env.RECOGNITION_FREE_TIER = "true";
    assert.equal(recognitionConfig().configured, false);

    delete process.env.RECOGNITION_API_KEY;
    delete process.env.RECOGNITION_PROVIDER;
    delete process.env.RECOGNITION_FREE_TIER;
    const unconfigured = await recognizeOnServer({ jpegBase64: "AA==" });
    assert.equal(unconfigured.mode, "demo");
    assert.equal(unconfigured.outcome, "unknown");
    assert.equal(unconfigured.note, "unconfigured");
  } finally {
    if (prevKey === undefined) delete process.env.RECOGNITION_API_KEY;
    else process.env.RECOGNITION_API_KEY = prevKey;
    if (prevProvider === undefined) delete process.env.RECOGNITION_PROVIDER;
    else process.env.RECOGNITION_PROVIDER = prevProvider;
    if (prevFree === undefined) delete process.env.RECOGNITION_FREE_TIER;
    else process.env.RECOGNITION_FREE_TIER = prevFree;
  }

  // Local matching when reference images are unavailable falls back to structural candidates or unknown.
  const noRefsStone = evaluateLocalSamples({
    evidence: {
      brightness: 0.52,
      warmth: 0.58,
      saturation: 0.16,
      green: 0.04,
      horizontal: 0.72,
      vertical: 0.22,
    },
    shotPatch: makePatch(140, 128, 112),
    refs: [],
  });
  assert.equal(noRefsStone.result.note, "references-unavailable");
  assert.notEqual(noRefsStone.result.outcome, "identified");

  // Low-light frame is flagged as low-light and returns unknown with zero candidates.
  const unrelated = evaluateLocalSamples({
    evidence: {
      brightness: 0.01,
      warmth: 0.1,
      saturation: 0.95,
      green: 0.9,
      horizontal: 0,
      vertical: 0,
    },
    shotPatch: makePatch(0, 250, 0),
    refs: [
      {
        slug: "stone-bridge",
        evidence: {
          brightness: 0.55,
          warmth: 0.58,
          saturation: 0.18,
          green: 0.05,
          horizontal: 0.7,
          vertical: 0.25,
        },
        patch: makePatch(150, 140, 130),
      },
    ],
  });
  assert.equal(unrelated.qualityIssue, "low-light");
  assert.equal(unrelated.result.outcome, "unknown");
  assert.equal(unrelated.result.candidates.length, 0);

  console.log("recognition fusion tests passed");
}

void run();
