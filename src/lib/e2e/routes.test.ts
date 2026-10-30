import assert from "node:assert/strict";
import { locales } from "@/i18n/locales";
import { events, walks } from "@/content/journeys";
import { dishes, restaurants } from "@/content/food";
import { institutions, places } from "@/content/places";

function run() {
  const paths = [
    "/",
    "/transport",
    "/scan",
    "/events",
    "/museums",
    "/food",
    "/around",
    "/legal",
    "/privacy",
    "/terms",
    "/cookies",
    ...places.map((place) => (place.institution ? `/museums/${place.slug}` : `/places/${place.slug}`)),
    ...walks.map((walk) => `/routes/${walk.slug}`),
    ...events.map((event) => `/events/${event.slug}`),
    ...dishes.map((dish) => `/food/dishes/${dish.slug}`),
    ...restaurants.map((house) => `/food/places/${house.slug}`),
  ];
  assert.ok(paths.includes("/"));
  assert.ok(institutions().length >= 9);
  assert.equal(locales.length, 6);
  const prefixed = locales.flatMap((locale) =>
    paths.map((path) => (locale === "en" ? path : `/${locale}${path === "/" ? "" : path}`)),
  );
  assert.ok(prefixed.includes("/mk/events"));
  assert.ok(prefixed.includes("/mk/museums"));
  assert.ok(prefixed.includes("/tr/scan"));
  console.log("route table ok", paths.length, "paths,", prefixed.length, "locale URLs");
}

run();
