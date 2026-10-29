export type RecognitionMode = "remote" | "demo";

export type RecognitionOutcome = "identified" | "candidates" | "unknown" | "out-of-catalogue";

export type RecognitionCandidate = {
  slug: string;
  score: number;
  sources: Array<"vision" | "reference" | "structure" | "proximity">;
  rationale?: string;
};

export type RecognitionResult = {
  mode: RecognitionMode;
  outcome: RecognitionOutcome;
  candidates: RecognitionCandidate[];
  /** Never 1. Capped below certainty. */
  leadingScore: number;
  threshold: number;
  usedLocation: boolean;
  retainedImage: false;
  provider?: string;
  note?: string;
};

export type LocationHint = {
  lat: number;
  lng: number;
};

export type StructureMatch = {
  slug: string;
  score: number;
};

export const MAX_CONFIDENCE = 0.97;
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const RECOGNITION_TIMEOUT_MS = 20_000;

export const THRESHOLDS = {
  remote: { identify: 0.58, gap: 0.12, consider: 0.4 },
  demo: { identify: 0.68, gap: 0.1, consider: 0.52 },
} as const;
