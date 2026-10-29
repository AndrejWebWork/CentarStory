import { getPlace } from "@/content/places";
import { events, listEvents, walks } from "@/content/knowledge/adapter";

export { events, listEvents, walks };

export function getWalk(slug: string) {
  return walks.find((walk) => walk.slug === slug);
}

export function getEvent(slug: string) {
  return listEvents().find((event) => event.slug === slug);
}

export function walksThrough(placeSlug: string) {
  return walks.filter((walk) => walk.stops.includes(placeSlug));
}

export function eventsAt(placeSlug: string) {
  return listEvents().filter((event) => event.venues.includes(placeSlug));
}

for (const walk of walks) {
  for (const stop of walk.stops) {
    if (!getPlace(stop)) throw new Error(`Unknown stop ${stop} on ${walk.slug}`);
  }
}

for (const event of events) {
  for (const venue of event.venues) {
    if (!getPlace(venue)) throw new Error(`Unknown venue ${venue} on ${event.slug}`);
  }
}
