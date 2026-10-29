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

function env(name: string) {
  return process.env[name]?.trim() || undefined;
}

export function recognitionConfig() {
  const key = env("RECOGNITION_API_KEY");
  const provider = (env("RECOGNITION_PROVIDER") ?? (key ? "openai" : "")).toLowerCase();
  return {
    configured: Boolean(key && provider),
    provider: key ? provider : "none",
    model:
      env("RECOGNITION_MODEL") ??
      (provider === "google"
        ? "gemini-2.0-flash"
        : provider === "anthropic"
          ? "claude-sonnet-4-5"
          : "gpt-4o-mini"),
    baseUrl: env("RECOGNITION_BASE_URL") ?? env("RECOGNITION_API_URL"),
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

async function callOpenAI(jpegBase64: string, model: string, key: string, baseUrl?: string) {
  const url = `${(baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: `Catalogue:\n${cataloguePrompt()}` },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${jpegBase64}`, detail: "low" },
            },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(RECOGNITION_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`vision-http-${response.status}`);
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGoogle(jpegBase64: string, model: string, key: string) {
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
  if (!response.ok) throw new Error(`vision-http-${response.status}`);
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
}

async function callAnthropic(jpegBase64: string, model: string, key: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      temperature: 0,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Catalogue:\n${cataloguePrompt()}` },
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: jpegBase64 },
            },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(RECOGNITION_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`vision-http-${response.status}`);
  const data = (await response.json()) as { content?: Array<{ text?: string }> };
  return data.content?.map((part) => part.text ?? "").join("") ?? "";
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

  let raw = "";
  if (config.provider === "google") raw = await callGoogle(input.jpegBase64, config.model, key);
  else if (config.provider === "anthropic") raw = await callAnthropic(input.jpegBase64, config.model, key);
  else raw = await callOpenAI(input.jpegBase64, config.model, key, config.baseUrl);

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
