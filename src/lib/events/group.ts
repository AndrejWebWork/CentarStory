import type { CulturalEvent } from "@/content/types";

export function liveEvents(events: CulturalEvent[]) {
  return events.filter((event) => event.status === "ongoing" || event.status === "upcoming");
}

export function closedEvents(events: CulturalEvent[]) {
  return events.filter((event) => event.status === "past");
}

export function confirmDateEvents(events: CulturalEvent[]) {
  return events.filter((event) => event.status === "recurring-confirm-dates");
}
