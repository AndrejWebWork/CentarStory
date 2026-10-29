import { NextResponse } from "next/server";
import { getMedia } from "@/content/knowledge/media";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const asset = getMedia(id);
  if (!asset) return NextResponse.json({ error: "unknown-image" }, { status: 404 });

  const response = await fetch(asset.url, {
    headers: { "User-Agent": "CentarStory/1.0 (heritage guide; reference photograph)" },
    cache: "force-cache",
  });
  if (!response.ok) {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
  const type = response.headers.get("content-type") ?? "image/jpeg";
  return new NextResponse(response.body, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
