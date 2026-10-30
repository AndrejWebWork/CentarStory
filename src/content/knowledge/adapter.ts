import { walkMinutesFromSquare } from "@/content/knowledge/boundary";
import { sites } from "@/content/knowledge/catalog";
import { dishes as dishRecords, districts as districtRecords, venues } from "@/content/knowledge/culinary";
import { programmes, routes } from "@/content/knowledge/programmes";
import type { CulturalEvent, Dish, District, Place, Restaurant, Walk } from "@/content/types";
import { resolveEvent } from "@/lib/events/status";

export function toPlace(site: (typeof sites)[number]): Place {
  return {
    slug: site.slug,
    kinds: site.kinds,
    institution: site.institution,
    coordinates: site.coordinates,
    era: site.era,
    name: site.officialName,
    eyebrow: site.eyebrow,
    summary: site.summary,
    story: site.story,
    visit: site.visit,
    address: site.address,
    collection: site.collection,
    walkMinutes: walkMinutesFromSquare(site.coordinates),
    related: site.related,
    palette: site.palette,
    motif: site.motif,
    municipality: site.municipality,
    verificationStatus: site.verificationStatus,
    lastChecked: site.lastChecked,
    nearbyNote: site.nearbyNote,
    boundaryNote: site.boundaryNote,
  };
}

export const places: Place[] = sites.map(toPlace);

const bySlug = new Map(places.map((place) => [place.slug, place]));

export function getPlace(slug: string) {
  return bySlug.get(slug);
}

export function sitePath(place: Place) {
  return place.institution ? `/museums/${place.slug}` : `/places/${place.slug}`;
}

export function placesByKind(kind: Place["kinds"][number]) {
  return places.filter((place) => place.kinds.includes(kind));
}

export function institutions() {
  return places.filter((place) => place.institution);
}

export const districts: District[] = districtRecords.map((district) => ({
  slug: district.slug,
  name: district.name,
  summary: district.summary,
  approach: district.approach,
  coordinates: district.coordinates,
  municipality: district.municipality,
  nearbyNote: district.nearbyNote,
}));

export const dishes: Dish[] = dishRecords.map((dish) => ({
  slug: dish.slug,
  name: dish.name,
  eyebrow: dish.eyebrow,
  summary: dish.summary,
  story: dish.story,
  eat: dish.eat,
  palette: dish.palette,
  imageId: dish.imageId,
}));

export const restaurants: Restaurant[] = venues.map((venue) => ({
  slug: venue.slug,
  name: venue.name,
  district: venue.district,
  venueKind: venue.venueKind,
  serves: venue.serves,
  summary: venue.summary,
  practical: venue.practical,
  hours: venue.hours,
  osmOpeningHours: venue.osmOpeningHours,
  municipality: venue.municipality,
  verificationStatus: venue.verificationStatus,
  nearbyNote: venue.nearbyNote,
  coordinates: venue.coordinates,
  address: venue.address,
  website: venue.website,
  phone: venue.phone,
  lastChecked: venue.lastChecked,
}));

export const walks: Walk[] = routes.map((route) => ({
  slug: route.slug,
  name: route.name,
  summary: route.summary,
  story: route.story,
  stops: route.stops,
  duration: route.duration,
}));

export function listEvents(today: Date = new Date()): CulturalEvent[] {
  return programmes.map((event) => {
    // Resolve status in Skopje time from the sourced calendar.
    const resolved = resolveEvent(event, today);
    return {
      slug: event.slug,
      name: event.name,
      season: event.season,
      summary: event.summary,
      story: event.story,
      venues: event.venues,
      host: event.host,
      officialUrl: event.officialUrl,
      status: resolved.status,
      startDate: resolved.startDate,
      endDate: resolved.endDate,
      nextDate: resolved.nextDate,
      lastChecked: event.lastChecked,
      verificationStatus: event.verificationStatus,
    };
  });
}

export const events: CulturalEvent[] = listEvents();
