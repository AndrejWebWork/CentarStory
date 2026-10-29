"use client";

import { useEffect, useState } from "react";
import type { Coordinates } from "@/content/types";
import { loadWalkingPath, type WalkPath } from "@/lib/mapping/walk";

export function useWalkingPath(points: Coordinates[] | null) {
  const key =
    points?.map((point) => `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`).join(";") ?? "";
  const [tracked, setTracked] = useState(key);
  const [status, setStatus] = useState<"idle" | "loading" | "ready">(key ? "loading" : "idle");
  const [path, setPath] = useState<WalkPath | null>(null);

  if (tracked !== key) {
    setTracked(key);
    setStatus(key ? "loading" : "idle");
    setPath(null);
  }

  useEffect(() => {
    if (!key) return;
    const current = key.split(";").map((pair) => {
      const [lat, lng] = pair.split(",");
      return { lat: Number(lat), lng: Number(lng) };
    });
    if (current.length < 2 || current.some((point) => Number.isNaN(point.lat) || Number.isNaN(point.lng))) {
      return;
    }
    let cancelled = false;
    loadWalkingPath(current).then((next) => {
      if (cancelled) return;
      setPath(next);
      setStatus("ready");
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { status, path };
}
