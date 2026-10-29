import { NextResponse } from "next/server";
import { recognitionConfig } from "@/lib/recognition/server";

export function GET() {
  const recognition = recognitionConfig();

  return NextResponse.json({
    recognition: {
      mode: recognition.configured ? "remote" : "demo",
      providerConfigured: recognition.configured,
      provider: recognition.configured ? recognition.provider : "none",
    },
    maps: {
      provider: "openstreetmap",
      keyRequired: false,
    },
  });
}
