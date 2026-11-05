import type { MetadataRoute } from "next";
import { dishes, restaurants } from "@/content/food";
import { events, walks } from "@/content/journeys";
import { postedEvents } from "@/lib/events/managed";
import { places, sitePath } from "@/content/places";
import { locales } from "@/i18n/locales";
import { localeHref } from "@/lib/seo/site";

const staticPaths = [
  "/",
  "/around",
  "/scan",
  "/museums",
  "/food",
  "/events",
  "/transport",
  "/legal",
  "/privacy",
  "/terms",
  "/cookies",
  "/impressum",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...staticPaths,
    ...places.map((place) => sitePath(place)),
    ...walks.map((walk) => `/routes/${walk.slug}`),
    ...events.map((event) => `/events/${event.slug}`),
    ...postedEvents().map((event) => `/events/${event.slug}`),
    ...restaurants.map((restaurant) => `/food/places/${restaurant.slug}`),
    ...dishes.map((dish) => `/food/dishes/${dish.slug}`),
  ];
  const seen = new Set<string>();
  const unique = paths.filter((path) => (seen.has(path) ? false : (seen.add(path), true)));

  return unique.flatMap((path) =>
    locales.map((locale) => ({
      url: localeHref(locale, path),
      changeFrequency: path === "/" || path === "/events" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : path.split("/").length <= 2 ? 0.8 : 0.6,
      alternates: {
        languages: Object.fromEntries(locales.map((item) => [item, localeHref(item, path)])),
      },
    })),
  );
}
