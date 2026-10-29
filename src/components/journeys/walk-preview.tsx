"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { AtlasMarker } from "@/components/map/explore-map";
import type { Coordinates } from "@/content/types";
import { useWalkingPath } from "@/lib/mapping/use-walking-path";

const Atlas = dynamic(
  () => import("@/components/map/explore-map").then((mod) => mod.ExploreMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-paper-2" /> },
);

export function WalkPreview({
  markers,
  label,
}: {
  markers: AtlasMarker[];
  label: string;
}) {
  const t = useTranslations("explore");
  const [selected, setSelected] = useState<string | null>(markers[0]?.id ?? null);
  const points = useMemo<Coordinates[]>(
    () => markers.map((marker) => ({ lat: marker.lat, lng: marker.lng })),
    [markers],
  );
  const walking = useWalkingPath(points);
  const note =
    walking.status === "loading"
      ? t("routeLoading")
      : walking.path?.source === "street" && walking.path.minutes
        ? t("routeStreet", { minutes: walking.path.minutes })
        : walking.path?.source === "direct"
          ? t("routeDirect")
          : null;

  return (
    <div className="overflow-hidden border border-line">
      <div className="h-80">
        <Atlas
          markers={markers}
          selectedId={selected}
          onSelect={setSelected}
          line={walking.path?.positions ?? null}
          user={null}
          label={label}
        />
      </div>
      {note ? (
        <p className="border-t border-line px-4 py-3 text-sm text-ink-soft" aria-live="polite">
          {note}
        </p>
      ) : null}
    </div>
  );
}
