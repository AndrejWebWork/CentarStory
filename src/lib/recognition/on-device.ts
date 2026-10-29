import { analyzeSource, matchProfiles, type Evidence } from "@/lib/recognition/analyze";
import { referenceBindings, visionCatalogue } from "@/lib/recognition/catalogue";
import { decideOutcome, fuseCandidates } from "@/lib/recognition/fuse";
import { profiles } from "@/lib/recognition/profiles";
import type { LocationHint, RecognitionResult, StructureMatch } from "@/lib/recognition/types";

type RefSample = { slug: string; evidence: Evidence; patch: ImageData };

function evidenceSimilarity(a: Evidence, b: Evidence) {
  const keys: (keyof Evidence)[] = ["brightness", "warmth", "saturation", "green", "horizontal", "vertical"];
  const sum = keys.reduce((total, key) => total + (1 - Math.abs(a[key] - b[key])), 0);
  return sum / keys.length;
}

function patchFrom(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 24;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("canvas-unavailable");
  context.drawImage(source, 0, 0, width, height, 0, 0, 32, 24);
  return context.getImageData(0, 0, 32, 24);
}

function patchSimilarity(a: ImageData, b: ImageData) {
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

let cachedRefs: RefSample[] | null = null;

async function referenceLibrary(): Promise<RefSample[]> {
  if (cachedRefs) return cachedRefs;
  const samples: RefSample[] = [];
  await Promise.all(
    referenceBindings().map(async (binding) => {
      try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.crossOrigin = "anonymous";
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error("ref"));
          el.src = `/api/media/${binding.imageId}`;
        });
        samples.push({
          slug: binding.slug,
          evidence: analyzeSource(image, image.naturalWidth, image.naturalHeight),
          patch: patchFrom(image, image.naturalWidth, image.naturalHeight),
        });
      } catch {
        /* Skip a reference that cannot be decoded. */
      }
    }),
  );
  cachedRefs = samples;
  return samples;
}

export async function recognizeOnDevice(
  canvas: HTMLCanvasElement,
  location?: LocationHint | null,
): Promise<{ evidence: Evidence; structure: StructureMatch[]; result: RecognitionResult }> {
  const evidence = analyzeSource(canvas, canvas.width, canvas.height);
  const structure = matchProfiles(evidence, profiles);
  const refs = await referenceLibrary();
  const shotPatch = patchFrom(canvas, canvas.width, canvas.height);
  const references = refs.map((item) => ({
    slug: item.slug,
    score: evidenceSimilarity(evidence, item.evidence) * 0.22 + patchSimilarity(shotPatch, item.patch) * 0.78,
  }));

  const coordinates = Object.fromEntries(visionCatalogue().map((entry) => [entry.slug, { lat: entry.lat, lng: entry.lng }]));
  const candidates = fuseCandidates({
    mode: "demo",
    vision: [],
    structure,
    references,
    location,
    coordinates,
  });
  const referenced = candidates.filter((item) => item.sources.includes("reference"));
  const decided = decideOutcome("demo", referenced);
  const top = referenced[0];
  const strongReference = Boolean(top && top.score >= 0.68);
  const outcome =
    decided.outcome === "identified" && strongReference
      ? "identified"
      : decided.outcome === "unknown" || !top
        ? "unknown"
        : "candidates";

  return {
    evidence,
    structure,
    result: {
      mode: "demo",
      outcome,
      candidates: outcome === "unknown" ? [] : referenced.slice(0, 4),
      leadingScore: top?.score ?? 0,
      threshold: decided.threshold,
      usedLocation: Boolean(location),
      retainedImage: false,
    },
  };
}
