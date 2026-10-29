import type { Copy } from "@/content/types";
import type { GraphLeg } from "@/lib/graph/types";

export type ItineraryBudget =
  | { mode: "duration"; minutes: 45 | 90 | 180 }
  | { mode: "stops"; count: 3 | 5 | 7 };

export type ItineraryInput = {
  start: { kind: "site"; slug: string } | { kind: "gps"; lat: number; lng: number };
  themeId: string;
  budget: ItineraryBudget;
  today?: Date;
};

export type ItineraryStop = {
  slug: string;
  openingNote?: Copy;
  likelyClosedToday: boolean;
};

export type ItineraryPlan = {
  themeId: string;
  startSlug: string;
  startSource: "site" | "gps" | "fallback-square";
  stops: ItineraryStop[];
  legs: GraphLeg[];
  estimatedMeters: number;
  estimatedMinutes: number;
  warnings: Copy[];
};

export const ITINERARY_THEMES: { id: string; kind: "person" | "period" | "event" | "style" | "theme" }[] = [
  { id: "skopje-2014", kind: "style" },
  { id: "ottoman-masonry", kind: "style" },
  { id: "1963-memory", kind: "period" },
  { id: "ilinden", kind: "event" },
  { id: "civic-axis", kind: "theme" },
  { id: "quay-museums", kind: "theme" },
  { id: "person:stevanovska", kind: "person" },
  { id: "municipal-programme", kind: "theme" },
  { id: "civic-institutions", kind: "theme" },
  { id: "hill", kind: "theme" },
];
