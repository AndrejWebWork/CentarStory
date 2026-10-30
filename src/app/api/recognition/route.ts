import { NextResponse } from "next/server";
import { recognitionConfig, recognizeOnServer } from "@/lib/recognition/server";
import { MAX_UPLOAD_BYTES, type LocationHint, type StructureMatch } from "@/lib/recognition/types";

export const runtime = "nodejs";

type Body = {
  image?: string;
  lat?: number;
  lng?: number;
  structure?: StructureMatch[];
};

function jpegFromDataUrl(value: string) {
  const match = value.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
  if (!match?.[1]) return null;
  if (match[1].length * 0.75 > MAX_UPLOAD_BYTES) return null;
  return match[1];
}

export async function POST(request: Request) {
  const config = recognitionConfig();
  if (!config.configured) {
    return NextResponse.json({ error: "unconfigured" }, { status: 501 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const jpeg = typeof body.image === "string" ? jpegFromDataUrl(body.image) : null;
  if (!jpeg) {
    return NextResponse.json({ error: "invalid-image" }, { status: 400 });
  }

  const location: LocationHint | null =
    Number.isFinite(body.lat) && Number.isFinite(body.lng)
      ? { lat: Number(body.lat), lng: Number(body.lng) }
      : null;

  try {
    const result = await recognizeOnServer({
      jpegBase64: jpeg,
      location,
      structure: Array.isArray(body.structure) ? body.structure.slice(0, 12) : [],
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const timedOut = /timeout|aborted/i.test(message);
    const quota = /quota-exhausted/i.test(message);
    return NextResponse.json(
      { error: quota ? "quota-exhausted" : timedOut ? "timeout" : "provider-failed" },
      { status: quota ? 429 : timedOut ? 504 : 502 },
    );
  }
}
