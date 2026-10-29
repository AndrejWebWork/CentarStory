import { haversineMeters } from "@/content/knowledge/boundary";
import {
  MAX_CONFIDENCE,
  THRESHOLDS,
  type LocationHint,
  type RecognitionCandidate,
  type RecognitionMode,
  type RecognitionOutcome,
  type StructureMatch,
} from "@/lib/recognition/types";

type VisionHit = {
  slug: string;
  score: number;
  rationale?: string;
};

function clamp(value: number) {
  return Math.min(MAX_CONFIDENCE, Math.max(0, value));
}

function proximityBoost(meters: number) {
  if (meters <= 180) return 0.1;
  if (meters <= 450) return 0.06;
  if (meters <= 900) return 0.03;
  return 0;
}

export function fuseCandidates(input: {
  mode: RecognitionMode;
  vision: VisionHit[];
  structure: StructureMatch[];
  references: StructureMatch[];
  location?: LocationHint | null;
  coordinates: Record<string, { lat: number; lng: number }>;
}): RecognitionCandidate[] {
  const slugs = new Set<string>([
    ...input.vision.map((item) => item.slug),
    ...input.structure.map((item) => item.slug),
    ...input.references.map((item) => item.slug),
  ]);

  const visionBy = new Map(input.vision.map((item) => [item.slug, item]));
  const structureBy = new Map<string, number>();
  for (const item of input.structure) {
    const score = item.score / 100;
    structureBy.set(item.slug, Math.max(structureBy.get(item.slug) ?? 0, score));
  }
  const referenceBy = new Map<string, number>();
  for (const item of input.references) {
    referenceBy.set(item.slug, Math.max(referenceBy.get(item.slug) ?? 0, item.score));
  }

  const fused: RecognitionCandidate[] = [];

  for (const slug of slugs) {
    const vision = visionBy.get(slug);
    const structure = structureBy.get(slug) ?? 0;
    const reference = referenceBy.get(slug) ?? 0;
    const sources: RecognitionCandidate["sources"] = [];
    let imageScore = 0;

    if (vision) {
      imageScore = Math.max(imageScore, vision.score);
      sources.push("vision");
    }
    if (reference > 0) {
      imageScore = Math.max(imageScore, reference * 0.92 + structure * 0.08);
      sources.push("reference");
    }
    if (structure > 0) {
      if (!vision && reference === 0) imageScore = Math.max(imageScore, structure * 0.86);
      else imageScore = Math.max(imageScore, imageScore * 0.88 + structure * 0.12);
      sources.push("structure");
    }

    if (imageScore < 0.22) continue;

    let score = imageScore;
    const point = input.coordinates[slug];
    if (input.location && point) {
      const meters = haversineMeters(input.location, point);
      const boost = proximityBoost(meters);
      if (boost > 0) {
        score = imageScore + boost * Math.min(1, imageScore / 0.35);
        sources.push("proximity");
      }
    }

    fused.push({
      slug,
      score: clamp(score),
      sources: [...new Set(sources)],
      rationale: vision?.rationale,
    });
  }

  return fused.sort((a, b) => b.score - a.score);
}

export function decideOutcome(
  mode: RecognitionMode,
  candidates: RecognitionCandidate[],
): { outcome: RecognitionOutcome; threshold: number } {
  const rules = THRESHOLDS[mode];
  const top = candidates[0];
  const second = candidates[1];
  if (!top || top.score < rules.consider) {
    return { outcome: "unknown", threshold: rules.identify };
  }
  const visionOrReference = top.sources.some((source) => source === "vision" || source === "reference" || source === "structure");
  if (!visionOrReference) {
    return { outcome: "unknown", threshold: rules.identify };
  }
  if (top.score >= rules.identify && top.score - (second?.score ?? 0) >= rules.gap) {
    return { outcome: "identified", threshold: rules.identify };
  }
  return { outcome: "candidates", threshold: rules.identify };
}

export function capDisplayedScore(score: number) {
  return Math.round(clamp(score) * 100);
}
