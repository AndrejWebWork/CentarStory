import type { CulturalEvent } from "@/content/types";

function byStart(a: CulturalEvent, b: CulturalEvent) {
  return (a.startDate ?? a.nextDate ?? "").localeCompare(b.startDate ?? b.nextDate ?? "");
}

function byEndDesc(a: CulturalEvent, b: CulturalEvent) {
  return (b.endDate ?? b.startDate ?? "").localeCompare(a.endDate ?? a.startDate ?? "");
}

export function liveEvents(events: CulturalEvent[]) {
  return events.filter((event) => event.status === "ongoing" || event.status === "upcoming").sort(byStart);
}

export function closedEvents(events: CulturalEvent[]) {
  return events.filter((event) => event.status === "past").sort(byEndDesc);
}

export function confirmDateEvents(events: CulturalEvent[]) {
  return events.filter((event) => event.status === "recurring-confirm-dates");
}
