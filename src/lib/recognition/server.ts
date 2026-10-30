import { visionCatalogue, isCatalogueSlug } from "@/lib/recognition/catalogue";
import { decideOutcome, fuseCandidates } from "@/lib/recognition/fuse";
import {
  MAX_CONFIDENCE,
  RECOGNITION_TIMEOUT_MS,
  type LocationHint,
  type RecognitionResult,
  type StructureMatch,
} from "@/lib/recognition/types";

type VisionHit = { slug: string; score: number; rationale?: string };

const FREE_GEMINI_MODELS = new Set(["gemini-2.0-flash", "gemini-2.5-flash"]);

function env(name: string) {
  return process.env[name]?.trim() || undefined;
}

/**
 * Paid AI endpoints (OpenAI, Anthropic, or paid Gemini models) are forbidden.
 * Only local browser matching is enabled by default; optional remote vision is
 * restricted to an explicitly opted-in free-tier Gemini Flash endpoint.
 */
export function recognitionConfig() {
  const key = env("RECOGNITION_API_KEY");
  const provider = (env("RECOGNITION_PROVIDER") ?? "").toLowerCase();
  const model = env("RECOGNITION_MODEL") ?? "gemini-2.0-flash";
  const freeTierOptIn = env("RECOGNITION_FREE_TIER") === "true";
  const allowedFree =
    Boolean(key) &&
    freeTierOptIn &&
    provider === "google-free" &&
    FREE_GEMINI_MODELS.has(model);

  return {
    configured: allowedFree,
    provider: allowedFree ? "google-free" : "none",
    model: allowedFree ? model : "none",
  };
}

function cataloguePrompt() {
  const entries = visionCatalogue().map((entry) => ({
    slug: entry.slug,
    names: entry.names.slice(0, 6),
    type: entry.entityType,
    look: entry.visual,
  }));
  return JSON.stringify(entries);
}

function parseHits(raw: string): { hits: VisionHit[]; outOfCatalogue: boolean } {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return { hits: [], outOfCatalogue: true };
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as {
      candidates?: Array<{ slug?: string; confidence?: number; rationale?: string }>;
      outOfCatalogue?: boolean;
    };
    const hits = (parsed.candidates ?? [])
      .map((item) => ({
        slug: item.slug ?? "",
        score: Math.min(MAX_CONFIDENCE, Math.max(0, Number(item.confidence) || 0)),
        rationale: item.rationale?.slice(0, 180),
      }))
      .filter((item) => isCatalogueSlug(item.slug));
    return {
      hits,
      outOfCatalogue: Boolean(parsed.outOfCatalogue) && hits.length === 0,
    };
  } catch {
    return { hits: [], outOfCatalogue: true };
  }
}

const SYSTEM = `You identify cultural landmarks in the Municipality of Centar, Skopje, from a photograph.
Use only visual evidence. Do not invent a match. Do not use GPS or EXIF. Do not claim 100% certainty.
Return JSON only: {"candidates":[{"slug":"...","confidence":0.0,"rationale":"visible features"}],"outOfCatalogue":false}
confidence is 0-0.97. Only use slugs from the supplied catalogue. If the photograph is not one of those places, return empty candidates and outOfCatalogue true.`;

async function callFreeGoogle(jpegBase64: string, model: string, key: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [
        {
          role: "user",
          parts: [
            { text: `Catalogue:\n${cataloguePrompt()}` },
            { inlineData: { mimeType: "image/jpeg", data: jpegBase64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0, responseMimeType: "application/json" },
    }),
    signal: AbortSignal.timeout(RECOGNITION_TIMEOUT_MS),
  });
  if (response.status === 429) throw new Error("quota-exhausted");
  if (!response.ok) throw new Error(`vision-http-${response.status}`);
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
}

export async function recognizeOnServer(input: {
  jpegBase64: string;
  location?: LocationHint | null;
  structure?: StructureMatch[];
}): Promise<RecognitionResult> {
  const config = recognitionConfig();
  const key = env("RECOGNITION_API_KEY");
  if (!config.configured || !key) {
    return {
      mode: "demo",
      outcome: "unknown",
      candidates: [],
      leadingScore: 0,
      threshold: 0.68,
      usedLocation: false,
      retainedImage: false,
      note: "unconfigured",
    };
  }

  const raw = await callFreeGoogle(input.jpegBase64, config.model, key);
  const parsed = parseHits(raw);
  const coordinates = Object.fromEntries(
    visionCatalogue().map((entry) => [entry.slug, { lat: entry.lat, lng: entry.lng }]),
  );
  const candidates = fuseCandidates({
    mode: "remote",
    vision: parsed.hits,
    structure: input.structure ?? [],
    references: [],
    location: input.location,
    coordinates,
  });
  if (parsed.outOfCatalogue && candidates.length === 0) {
    return {
      mode: "remote",
      outcome: "out-of-catalogue",
      candidates: [],
      leadingScore: 0,
      threshold: 0.58,
      usedLocation: Boolean(input.location),
      retainedImage: false,
      provider: config.provider,
    };
  }
  const decided = decideOutcome("remote", candidates);
  return {
    mode: "remote",
    outcome: decided.outcome,
    candidates: candidates.slice(0, 4),
    leadingScore: candidates[0]?.score ?? 0,
    threshold: decided.threshold,
    usedLocation: Boolean(input.location),
    retainedImage: false,
    provider: config.provider,
  };
}
