"use client";

import { useSyncExternalStore } from "react";
import { SCAN_CAPTURE_STORAGE_KEY } from "@/lib/scan/capture";

function readCapture(slug: string, enabled: boolean) {
  if (!enabled || typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SCAN_CAPTURE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { slug?: string; dataUrl?: string };
    if (parsed.slug === slug && parsed.dataUrl?.startsWith("data:image/")) {
      return parsed.dataUrl;
    }
  } catch {
    /* Session storage is optional. */
  }
  return null;
}

export function useScanCapture(slug: string, enabled: boolean) {
  return useSyncExternalStore(
    () => () => {},
    () => readCapture(slug, enabled),
    () => null,
  );
}
