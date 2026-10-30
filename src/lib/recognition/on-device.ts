import {
  analyzeSource,
  assessImageQuality,
  matchProfiles,
  type Evidence,
  type ImageQualityIssue,
} from "@/lib/recognition/analyze";
import { visionCatalogue } from "@/lib/recognition/catalogue";
import {
  PRECOMPUTED_REFERENCE_EMBEDDINGS,
  type PrecomputedReferenceEmbedding,
} from "@/lib/recognition/embeddings";
import { decideOutcome, fuseCandidates } from "@/lib/recognition/fuse";
import { profiles } from "@/lib/recognition/profiles";
import type { LocationHint, RecognitionResult, StructureMatch } from "@/lib/recognition/types";

type RefSample = { slug: string; evidence: Evidence; patch: ImageData };

export function evidenceSimilarity(a: Evidence, b: Evidence) {
  const keys: (keyof Evidence)[] = ["brightness", "warmth", "saturation", "green", "horizontal", "vertical"];
  const sum = keys.reduce((total, key) => total + (1 - Math.abs(a[key] - b[key])), 0);
  return sum / keys.length;
}

export function patchSimilarity(a: ImageData, b: ImageData) {
  let sum = 0;
  const n = Math.min(a.data.length, b.data.length);
  for (let i = 0; i < n; i += 4) {
    sum += Math.abs((a.data[i] ?? 0) - (b.data[i] ?? 0));
    sum += Math.abs((a.data[i + 1] ?? 0) - (b.data[i + 1] ?? 0));
    sum += Math.abs((a.data[i + 2] ?? 0) - (b.data[i + 2] ?? 0));
  }
  const pixels = n / 4;
  const meanAbs = sum / (pixels * 3 * 255);
  return Math.max(0, 1 - meanAbs / 0.34);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < n; i += 1) {
    const va = a[i] ?? 0;
    const vb = b[i] ?? 0;
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : Math.max(0, Math.min(1, dot / denom));
}

export function dhashSimilarity(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;
  let diff = 0;
  for (let i = 0; i < len; i += 1) {
    if (a[i] !== b[i]) diff += 1;
  }
  return Math.max(0, 1 - diff / len);
}

export function embeddingSimilarity(
  shot: { embedding: number[]; dhash: string },
  ref: PrecomputedReferenceEmbedding,
): number {
  const cos = cosineSimilarity(shot.embedding, ref.embedding);
  const hashSim = dhashSimilarity(shot.dhash, ref.dhash);
  // Rescale high-baseline positive-octant cosine into discriminative [0..1] range
  const scaledCos = Math.max(0, Math.min(1, (cos - 0.8) / 0.2));
  return scaledCos * 0.45 + hashSim * 0.55;
}

function extractDescriptorFromCanvas(source: CanvasImageSource, width: number, height: number): {
  embedding: number[];
  dhash: string;
} {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 12;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas-unavailable");
  ctx.drawImage(source, 0, 0, width, height, 0, 0, 16, 12);
  const data = ctx.getImageData(0, 0, 16, 12).data;
  const vec: number[] = [];
  for (let cy = 0; cy < 6; cy += 1) {
    for (let cx = 0; cx < 8; cx += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let dy = 0; dy < 2; dy += 1) {
        for (let dx = 0; dx < 2; dx += 1) {
          const idx = ((cy * 2 + dy) * 16 + (cx * 2 + dx)) * 4;
          r += data[idx] ?? 0;
          g += data[idx + 1] ?? 0;
          b += data[idx + 2] ?? 0;
        }
      }
      vec.push(r / 1020, g / 1020, b / 1020);
    }
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  const embedding = vec.map((v) => v / norm);

  const dc = document.createElement("canvas");
  dc.width = 9;
  dc.height = 8;
  const dctx = dc.getContext("2d", { willReadFrequently: true });
  if (!dctx) throw new Error("canvas-unavailable");
  dctx.drawImage(source, 0, 0, width, height, 0, 0, 9, 8);
  const ddata = dctx.getImageData(0, 0, 9, 8).data;
  let dhash = "";
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const i1 = (y * 9 + x) * 4;
      const i2 = (y * 9 + x + 1) * 4;
      const l1 = (ddata[i1] ?? 0) * 0.299 + (ddata[i1 + 1] ?? 0) * 0.587 + (ddata[i1 + 2] ?? 0) * 0.114;
      const l2 = (ddata[i2] ?? 0) * 0.299 + (ddata[i2 + 1] ?? 0) * 0.587 + (ddata[i2 + 2] ?? 0) * 0.114;
      dhash += l1 < l2 ? "1" : "0";
    }
  }

  return { embedding, dhash };
}

export function evaluateLocalSamples(input: {
  evidence: Evidence;
  shotPatch?: ImageData;
  refs?: RefSample[];
  precomputedScores?: StructureMatch[];
  location?: LocationHint | null;
}): { structure: StructureMatch[]; qualityIssue: ImageQualityIssue; result: RecognitionResult } {
  const qualityIssue = assessImageQuality(input.evidence);
  const structure = matchProfiles(input.evidence, profiles);
  const patchReferences =
    input.refs && input.shotPatch
      ? input.refs.map((item) => ({
          slug: item.slug,
          score:
            evidenceSimilarity(input.evidence, item.evidence) * 0.22 +
            patchSimilarity(input.shotPatch!, item.patch) * 0.78,
        }))
      : [];
  const references = [...(input.precomputedScores ?? []), ...patchReferences];
  if (qualityIssue) {
    return {
      structure,
      qualityIssue,
      result: {
        mode: "demo",
        outcome: "unknown",
        candidates: [],
        leadingScore: 0,
        threshold: 0.68,
        usedLocation: Boolean(input.location),
        retainedImage: false,
        note: qualityIssue,
      },
    };
  }
  const coordinates = Object.fromEntries(
    visionCatalogue().map((entry) => [entry.slug, { lat: entry.lat, lng: entry.lng }]),
  );
  const candidates = fuseCandidates({
    mode: "demo",
    vision: [],
    structure,
    references,
    location: input.location,
    coordinates,
  });
  const referenced = candidates.filter((item) => item.sources.includes("reference") && item.score >= 0.6);
  const pool = referenced.length > 0 ? referenced : candidates.filter((item) => item.score >= 0.64);
  const decided = decideOutcome("demo", pool);
  const top = pool[0];
  const strongReference = Boolean(top && top.sources.includes("reference") && top.score >= 0.72);
  const outcome =
    decided.outcome === "identified" && strongReference
      ? "identified"
      : decided.outcome === "unknown" || !top
        ? "unknown"
        : "candidates";

  return {
    structure,
    qualityIssue,
    result: {
      mode: "demo",
      outcome,
      candidates: outcome === "unknown" ? [] : pool.slice(0, 4),
      leadingScore: top?.score ?? 0,
      threshold: decided.threshold,
      usedLocation: Boolean(input.location),
      retainedImage: false,
      note:
        qualityIssue ??
        (references.length === 0 ? "references-unavailable" : undefined),
    },
  };
}

export async function recognizeOnDevice(
  canvas: HTMLCanvasElement,
  location?: LocationHint | null,
): Promise<{
  evidence: Evidence;
  qualityIssue: ImageQualityIssue;
  structure: StructureMatch[];
  result: RecognitionResult;
}> {
  const evidence = analyzeSource(canvas, canvas.width, canvas.height);
  const descriptor = extractDescriptorFromCanvas(canvas, canvas.width, canvas.height);
  const precomputedScores: StructureMatch[] = PRECOMPUTED_REFERENCE_EMBEDDINGS.map((ref) => ({
    slug: ref.slug,
    score: embeddingSimilarity(descriptor, ref),
  }));
  const evaluated = evaluateLocalSamples({
    evidence,
    precomputedScores,
    location,
  });
  return {
    evidence,
    qualityIssue: evaluated.qualityIssue,
    structure: evaluated.structure,
    result: evaluated.result,
  };
}
