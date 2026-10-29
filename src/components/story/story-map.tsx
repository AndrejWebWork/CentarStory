"use client";

import dynamic from "next/dynamic";
import { useRouter } from "@/i18n/navigation";

const Atlas = dynamic(() => import("@/components/map/explore-map").then((mod) => mod.ExploreMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-paper-2" />,
});

export function StoryMap({
  markers,
  selectedId,
  label,
  hrefs,
}: {
  markers: Array<{ id: string; lat: number; lng: number; label: string; tone: "site" | "kitchen" | "nearby" }>;
  selectedId: string;
  label: string;
  hrefs: Record<string, string>;
}) {
  const router = useRouter();

  return (
    <div className="h-[22rem] overflow-hidden border border-line sm:h-[28rem]">
      <Atlas
        markers={markers}
        selectedId={selectedId}
        onSelect={(id) => {
          const href = hrefs[id];
          if (href && id !== selectedId) router.push(href);
        }}
        line={null}
        user={null}
        label={label}
      />
    </div>
  );
}
