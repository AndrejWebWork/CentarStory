import { NextResponse } from "next/server";
import { buildQualityReport, qualityMarkdown } from "@/lib/content/quality";

export function GET(request: Request) {
  const report = buildQualityReport();
  const format = new URL(request.url).searchParams.get("format");
  if (format === "md") {
    return new NextResponse(qualityMarkdown(report), {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }
  return NextResponse.json(report);
}
