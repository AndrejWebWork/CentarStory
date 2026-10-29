import type { LocationHint, RecognitionResult, StructureMatch } from "@/lib/recognition/types";

export async function requestRemoteRecognition(input: {
  dataUrl: string;
  location?: LocationHint | null;
  structure: StructureMatch[];
}): Promise<RecognitionResult> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 22_000);
  try {
    const response = await fetch("/api/recognition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: input.dataUrl,
        lat: input.location?.lat,
        lng: input.location?.lng,
        structure: input.structure.slice(0, 8),
      }),
      signal: controller.signal,
    });
    if (response.status === 501) {
      const error = new Error("unconfigured");
      throw error;
    }
    if (response.status === 504) throw new Error("timeout");
    if (!response.ok) throw new Error("network");
    return (await response.json()) as RecognitionResult;
  } finally {
    window.clearTimeout(timer);
  }
}
